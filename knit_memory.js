

//knit/algebra ======================================================
//hrm.  inelegant.


//knit/core ======================================================
if (!(typeof window === 'undefined')) global=window



//vendor/collection_functions ======================================================
CollectionFunctions = (function(){  

  var standardArrayFeatures = {
    iterator:function(collection){
      var position = 0
      return {
        next: function() {
          var result = collection[position]
          position += 1
          return result
        },
        hasNext: function(){return position<collection.length}
      }
    },
    nothing:function(){return null},
    get:function(array, index){return array[index]},
    equals:function(a,b){return a == b},
    newCollection:function(){return []},
    append:function(array, item){ array.push(item) },
    isCollection:function(thing){ return typeof thing.length != "undefined" && typeof thing.push != "undefined" },
    size:function(array){ return array.length },
    sort:function(array){ return [].concat(array).sort() },
    concat:function(){
      var firstArray = arguments[0]
      var otherArrays = []
      for(var i=1; i<arguments.length; i++) {otherArrays[i-1] = arguments[i]}
      return firstArray.concat.apply(firstArray, otherArrays)
    }
  }

  var mainFunction = function(userFeatures) {
    
    var factory = (function me(features, arrayFunctions, createAcrossCF) {
      
      //============ SETUP ============
      
      var featureRequirementBug = function(featureName){
        throw new Error("BUG: a missing feature is required in order to perform this operation. " +
                        "The developer should have prevented this function from being exported.")
      }
      
      var featureNames = ["iterator", "nothing", "equals", "newCollection", "append", 
                          "isCollection", "size", "concat", "comparator", "sort", "get"]
      for (var i=0; i<featureNames.length; i++) {
        var featureName = featureNames[i],
            halt = featureRequirementBug
        halt.unavailable = true
        features[featureName] = features[featureName] || halt
      }

      function feature(featureName) {
        return !features[featureName].unavailable
      }

      function getFeatureIfAvailable(featureName) {
        var feature = features[featureName]
        return feature.unavailable ? undefined : feature
      }
      
      var createAcrossCF = createAcrossCF==false ? false : true,
          breaker = {},
          functionsForExport = {}
            
            
      
      //============ COLLECTION FUNCTIONS ============
            
      var iteratorHolder = {iteratorFunction:features.iterator} //so we can wrap/override later
      function iterator(collection) {
        return iteratorHolder.iteratorFunction(collection)
      }
      if (feature("iterator")) 
        functionsForExport.iterator = iterator
      
      var getOne = getFeatureIfAvailable("get") ||
                     function(collection, index) {
                       var itemAtIndex = features.nothing()
                       each(collection, function(item, i){
                         if (i == index) {
                           itemAtIndex = item
                           return breaker
                         }
                       })
                       return itemAtIndex
                     }
      
      function get(collection, indexOrIndexes) {
        if (typeof indexOrIndexes.length != "undefined") {
          var indexes = indexOrIndexes
          return arrayFunctions.map(indexes, function(index){return getOne(collection, index)})
        } else {
          var index = indexOrIndexes
          return getOne(collection, index)
        }
      }
      if (functionsForExport.iterator ||
            feature("get")) 
        functionsForExport.get = get

      function each(collection, callback) {
        var count = 0
  
        var iteratorInstance = iterator(collection)
        while (iteratorInstance.hasNext()) {
          var item=iteratorInstance.next(),
              result = callback(item, count)
          if (result === breaker) break
          count += 1
        }
      }
      if (functionsForExport.iterator) 
        functionsForExport.each = each

      function detect(collection, matcher) {
        var hit = features.nothing()
        each(collection, function(item, i){
          if (matcher(item, i)) {
            hit = item
            return breaker
          }
        })
        return hit
      }
      if (functionsForExport.each && 
          feature("nothing")) 
        functionsForExport.detect = detect

      function select(collection, matcher) {
        var newCollection = features.newCollection()
        each(collection, function(item, i){
          if (matcher(item, i)) features.append(newCollection, item)
        })
        return newCollection
      }
      if (functionsForExport.each && 
          feature("newCollection") && 
          feature("append")) 
        functionsForExport.select = select

      function map(collection, transformer, newCollectionF, appenderF) {
        newCollectionF = newCollectionF || function(){return []}
        appenderF = appenderF  || function(arr, item){arr.push(item)}
  
        var newCollection = newCollectionF()
        each(collection, function(item, i){
          appenderF(newCollection, transformer(item, i))
        })
        return newCollection
      }
      if (functionsForExport.each && 
          feature("newCollection") && 
          feature("append")) 
        functionsForExport.map = map
      
      function pluck(collection, property) {
        return map(collection, function(item){
          var value = item[property]
          if (typeof value == "function") value = value.apply(item, [])
          return value
        })
      }
      if (functionsForExport.map) 
        functionsForExport.pluck = pluck

      function toCollection(thing, iteratorF) {
        iteratorF = iteratorF || arrayFunctions.iterator
        
        var newCollection = features.newCollection(),
            iteratorInstance = iteratorF(thing)
        while (iteratorInstance.hasNext()) features.append(newCollection, iteratorInstance.next())
        return newCollection
      }
      if (feature("newCollection") && 
          feature("append")) 
        functionsForExport.toCollection = toCollection

      function isSorted(collection) {
        var sorted = true,
            previousItem = null
        each(collection, function(item, i){
          if (i>=1 && features.comparator(previousItem, item) < 0) {
            sorted = false
            return breaker
          }
          previousItem = item
        })
        return sorted
      }
      if (functionsForExport.each && 
          feature("comparator")) 
        functionsForExport.isSorted = isSorted
      
      var sort = getFeatureIfAvailable("sort") || 
                   function(collection) {
                     var array = map(collection, function(item){return item})
                     array.sort(features.comparator())
                     var sortedCollection = map(array, function(item){return item}, features.newCollection, features.append)
                     return sortedCollection
                   }
      if (feature("sort") || 
            functionsForExport.map && 
            feature("comparator")) 
        functionsForExport.sort = sort
      
                                  //evaluator?  word?
      function sortBy(collection, evaluator) {
        var array = map(collection, function(item){return item})
        array.sort(function(a,b){
          var aValue = evaluator(a),
              bValue = evaluator(b)
          return aValue==bValue ? 0 : (aValue>bValue ? 1 : -1)
        })
        var sortedCollection = map(array, function(item){return item}, features.newCollection, features.append)
        return sortedCollection
      }
      if (functionsForExport.map) 
        functionsForExport.sortBy = sortBy
      
      function indexOf(collection, findMe) {
        var index = features.nothing()
        detect(collection, function(item, i){
          if (features.equals(item, findMe)) {
            index = i
            return true
          }
        })
        return index
      }
      
      function indexesOf(collection, findCollection) { //anglo-saxon rules win every time in this library
        return map(findCollection, function(item){return indexOf(collection, item)})
      }
      
      function include(collection, findMe) {
        return indexOf(collection, findMe) != features.nothing()
      }
      if (functionsForExport.detect && 
          feature("nothing") && 
          feature("equals")) {
        functionsForExport.indexOf = indexOf
        functionsForExport.indexesOf = indexesOf
        functionsForExport.include = include
      }
      
      function uniq(collection) {
        var newCollection = features.newCollection()
        each(collection, function(item){
          if (!include(newCollection, item)) features.append(newCollection, item)
        })
        return newCollection
      }
      if (functionsForExport.each && 
          functionsForExport.include && 
          feature("newCollection") && 
          feature("append"))
        functionsForExport.uniq = uniq
      
      
      function overlap(collectionA, collectionB, acceptor) {
        var result = select(collectionA, function(itemA) {
          return include(collectionB, itemA) == acceptor
        })
        result = uniq(result)
        return result
      }
      function intersect(collectionA, collectionB) { return overlap(collectionA, collectionB, true) }
      function differ(collectionA, collectionB) { return overlap(collectionA, collectionB, false) }
      if (functionsForExport.select && 
          functionsForExport.include && 
          functionsForExport.uniq) {
        functionsForExport.intersect = intersect
        functionsForExport.differ = differ
      }
         
      function without(collection, dontWantThisItem) {
        return select(collection, function(item) {
          return !features.equals(item, dontWantThisItem)
        })
      }
      if (functionsForExport.select && 
          feature("equals")) 
        functionsForExport.without = without
      
      function remove(collection, indexWeDontWant) {
        var newCollection = features.newCollection()
        each(collection, function(item,i) {
          if (i!=indexWeDontWant) features.append(newCollection, item)
        })
        return newCollection
      }
      if (functionsForExport.each && 
          feature("newCollection") && 
          feature("append"))
        functionsForExport.remove = remove

      function flatten(collection) {
        var newCollection = features.newCollection()
        each(collection, function(item){
          if (features.isCollection(item)) {
            var itemFlattened = flatten(item)
            each(itemFlattened, function(item) {
              features.append(newCollection, item)
            })
          } else {
            features.append(newCollection, item)
          }
        })
        return newCollection
      }
      if (functionsForExport.each && 
          feature("newCollection") && 
          feature("isCollection") && 
          feature("append")) 
        functionsForExport.flatten = flatten
      
      var concat = getFeatureIfAvailable("concat") || 
                     function() {
                       var newCollection = features.newCollection()
                       arrayFunctions.each(arguments, function(collection){
                         each(collection, function(item){features.append(newCollection, item)})
                       })
                       return newCollection
                     }
      if (feature("concat") || 
            feature("newCollection") && 
            feature("append")) 
        functionsForExport.all = 
        functionsForExport.clone = 
        functionsForExport.concat = concat
      
      function repeat(collection, times) {
        var repeated = features.newCollection()
        for (var i=0; i<times; i++) repeated = concat(repeated, collection)
        return repeated
      }
      if (functionsForExport.concat && 
          feature("newCollection"))
        functionsForExport.repeat = repeat
      
      /*
      Hey look my head is hurting too.  But this is worth it, I think! (?)
      We're expressing multi-collection capability through CF itself,
      meaning you get multi-collection detect, map, etc for free.  Yay!
      */
      var acrossCF = arrayFunctions && createAcrossCF ?
        me({iterator:function(collections){
                      var iteratorInstances = arrayFunctions.map(collections, function(collection){return iterator(collection)})
  
                      return {
                        next: function() {
                          return arrayFunctions.map(iteratorInstances, function(iterator){
                            return iterator.hasNext() ? iterator.next() : features.nothing()
                          }, features.newCollection, features.append)
                        },
                        hasNext: function(){
                          return arrayFunctions.detect(iteratorInstances, function(iterator){return iterator.hasNext()})
                        }
                      }
                    },
            equals:function(collectionA, collectionB){return equals(collectionA, collectionB)},
            nothing:features.nothing,
            newCollection:features.newCollection,
            append:features.append,
            isCollection:undefined, //doesn't make sense when dealing with multiple collections
          },
          arrayFunctions,
          false //to stop recursion
        ) :
        function(){throw "across not supported in this context"}
  
      function across() {
        var collections = arguments
        return acrossCF.makeObjectStyleFunctions(function(){return collections})
      }
  
      function zip() {
        var lastArgument = arguments[arguments.length-1]
    
        if (typeof lastArgument == "function") {
          var collections = arrayFunctions.slice(arguments, [0,-2]),
              callback = lastArgument
      
          across.apply(null, collections).each(function(entryCollection, i){
            callback.apply(null, arrayFunctions.map(entryCollection, function(item){return item}).concat([i]) )
          })
        } else {
          var collections = arguments
          return across.apply(null, collections).all()
        }
      }
      if (createAcrossCF) { //can't do across across because we would all die
        functionsForExport.across = across
        functionsForExport.zip = zip
      }

      function equals(collectionA, collectionB) {
        var acrossAB = across(collectionA, collectionB)
        var foundNotEqual = acrossAB.detect(function(pairCollection){
          var iter = features.iterator(pairCollection)
          var a = iter.next()
          var b = iter.next()
          return !features.equals(a, b)
        })
        return !foundNotEqual
      }
      if (functionsForExport.detect && 
          feature("iterator") && 
          feature("equals") && 
          feature("newCollection")) 
        functionsForExport.equals = equals
      
      var size = getFeatureIfAvailable("size") || 
                   function(collection) {
                     var count = 0
                     each(collection, function() { count += 1 })
                     return count          
                   }
      
      function empty(collection) { return size(collection) == 0 }
      if (feature("size") || functionsForExport.each) {
        functionsForExport.size = size
        functionsForExport.empty = empty
      }

      function slice(collection, a, b) {
        function sliceStartPlusLength(collection, startPos, length) {
          var newCollection = features.newCollection()
          each(collection, function(item, i) {
            if (i>=startPos) features.append(newCollection, item)
            if (i==(startPos+length-1)) return breaker
          })
    
          return newCollection
        }
  
        function sliceRange(collection, range) {
          var startPos = range[0],
              endPos = range[1]
    
          if (startPos>=0 && endPos>=0) {
            return sliceStartPlusLength(collection, startPos, endPos-startPos+1)
          } else {
            var theSize = size(collection),
                positiveStartPos = startPos<0 ? theSize + startPos : startPos,
                positiveEndPos = endPos<0 ? theSize + endPos : endPos
            return sliceRange(collection, [positiveStartPos, positiveEndPos])
          }
        }
  
        if (typeof a.length != "undefined") {
          var range = a
          return sliceRange(collection, range)
        } else {
          var startPos = a,
              length = b
          return sliceStartPlusLength(collection, startPos, length)
        }
      }
      if (functionsForExport.each && 
          feature("newCollection") && 
          feature("append")) 
        functionsForExport.slice = slice

      function splice(mainCollection, spliceInCollection, insertAtIndex, overwriteLength) {
        overwriteLength = overwriteLength || 0
        return concat(slice(mainCollection, [0, insertAtIndex-1]),
                      spliceInCollection, 
                      slice(mainCollection, [insertAtIndex + overwriteLength, -1]))
      }
      if (functionsForExport.concat && 
          functionsForExport.slice) 
        functionsForExport.splice = splice
      
      function inspect(collection) {
        var strings = []
        each(collection, function(item){ 
          strings.push(typeof item.inspect == "function" ? item.inspect() : "" + item)
        })
        return strings.join(",")
      }
      if (functionsForExport.each) functionsForExport.inspect = inspect




      //============ CONCLUSION ============

      function specialCurry(func, collectionFunc) {
        return function() {
          var args = []
          for(key in arguments){args[key] = arguments[key]}

          args.unshift(collectionFunc.apply(this, []))
          return func.apply(null, args)
        }
      }

      function makeObjectStyleFunctions(collectionGetter) {
        var curried = {}
        for(k in functionsForExport){curried[k] = specialCurry(functionsForExport[k], collectionGetter)}
        return curried
      }
      
      function layerOnCostTracking(functions) {
        iteratorHolder._callsToNext = 0
        var wrappedFunctions = {}
        
        function makeCostResettingWrapper(inner) {
          return function() {
            iteratorHolder._callsToNext = 0
            var args = arrayFunctions.map(arguments, function(arg){return arg}),
                result = inner.apply(this, args)
            return result                      
          }
        }
        
        for (k in functions) wrappedFunctions[k] = makeCostResettingWrapper(functions[k])
        
        var innerIteratorFunction = iteratorHolder.iteratorFunction
        iteratorHolder.iteratorFunction = function(collection) {
          var realIterator = innerIteratorFunction(collection)

          var realNext = realIterator.next
          realIterator.next = function() {
            iteratorHolder._callsToNext += 1
            return realNext()
          }
          return realIterator
        }
        
        wrappedFunctions.lastCost = function() { return iteratorHolder._callsToNext }
        
        return wrappedFunctions
      }
      
      function makeExports(functions) {
        return {
          functions:functions,
          decorate: function(target){for(k in functions){target[k] = functions[k]}},
          makeObjectStyleFunctions: makeObjectStyleFunctions,
          decorateObjectStyle: function(target, collectionGetter){
            var curriedFunctions = makeObjectStyleFunctions(collectionGetter)
            for(k in curriedFunctions){target[k] = curriedFunctions[k]}
          }
        }        
      }
      
      var originalExports = makeExports(functionsForExport),
          layeredStatsExports = makeExports(layerOnCostTracking(functionsForExport))
      originalExports.withStatTracking = layeredStatsExports
      return originalExports
    }) //end factory
    
    
    var arrayCF = factory.apply(null, [standardArrayFeatures])

    var f = factory(userFeatures, arrayCF.functions)
    f.appendFeatures = function(newFeatures) {
      var combined = {}
      for(var k in userFeatures) {combined[k] = userFeatures[k]}
      for(var k in newFeatures) {combined[k] = newFeatures[k]}
      return factory(combined, arrayCF.functions)
    }
    
    return f
  }
  
  var externalArrayCF = mainFunction.apply(null, [standardArrayFeatures]) //convenience
  externalArrayCF.functions.toArray = externalArrayCF.functions.toCollection
  externalArrayCF.withStatTracking.functions.toArray = externalArrayCF.withStatTracking.functions.toCollection
  delete externalArrayCF.functions.toCollection
  delete externalArrayCF.withStatTracking.functions.toCollection
  mainFunction.Array = externalArrayCF

  return mainFunction
})()

global.knit = {
  algebra: {predicate:{}},
  mixin:{},
  engine:{  /*hrm.  begone.*/ sql:{statement:{}}  },
  _:CollectionFunctions.Array.functions //handy underscore-like array functions...each, map, etc
}



//knit/util ======================================================
//internal utilities
knit._util = {

  bind: function(f, objectThatShouldBeThis) {
    return function() {
      var args = CollectionFunctions.Array.functions.toArray(arguments)
      return f.apply(objectThatShouldBeThis, args)
    }
  },
  
  extend: function(mergee, toMerge) {
    for(k in toMerge) mergee[k] = toMerge[k]
    return mergee
  },
  
  keys: function(obj) {
    var keys = []
    for (var k in obj) keys.push(k)
    return keys
  },
  
  values: function(obj) {
    var values = []
    for (var k in obj) values.push(obj[k])
    return values
  },
  
  isArray: function(thing){ 
    return typeof thing.length != "undefined" && typeof thing.push != "undefined" 
  }
  
}


//knit/quacks_like ======================================================

//see http://fitzgeraldnick.com/weblog/39/

knit.quacksLike = function(object, signature) {
  if (typeof signature === "undefined") throw("no signature provided")
  
  var k, ctor;
  for ( k in signature ) {
    ctor = signature[k];
    if ( ctor === Number ) {
      if ( Object.prototype.toString.call(object[k]) !== "[object Number]"
           || isNaN(object[k]) ) {
        return false;
      }
    } else if ( ctor === String ) {
      if ( Object.prototype.toString.call(object[k])
           !== "[object String]" ) {
        return false;
      }
    } else if ( ctor === Boolean ) {
      var value = object[k]
      if (!(value === true || value === false)) return false
    } else if ( ! (object[k] instanceof ctor) ) {
      return false;
    }
  }
  return true;
};


//knit/reference ======================================================
;(function(){

  var _A = CollectionFunctions.Array.functions,
      _ = knit._util
  
  knit.RelationReference = function(){
    var F = function(relationName) {
      this._relation = new knit.UnresolvedRelationReference(relationName)
    }; var p = F.prototype
  
    p.resolve = function(bindings) { 
      if (this._relation.resolve) this._relation = this._relation.resolve(bindings) 
      return this
    }
  
    _A.each(["id", "attributes", "attr", "inspect", "merge", "split", "newNestedAttribute", "perform"], function(methodNameToDelegate) {
      p[methodNameToDelegate] = function() { 
        return this._relation[methodNameToDelegate].apply(this._relation, arguments) 
      }
    })
  
    p.isSame = p.isEquivalent = function(other) { 
      return this._relation.isSame(other) || !!(other._relation && this._relation.isSame(other._relation))
    }
  
    return F
  }()

  knit.UnresolvedRelationReference = function(){
    var _id = 0
  
    var F = function(relationName) {
      this._relationName = relationName
      _id += 1
      this._id = "unresolvedRelation_" + _id
    }; var p = F.prototype
  
    p.id = function(bindings) { return this._id }
    p.resolve = function(bindings) { return bindings[this._relationName] }

    _A.each(["attributes", "attr", "merge", "split", "newNestedAttribute", "perform"], function(methodNameToDelegate) {
      p[methodNameToDelegate] = function() { 
        throw(methodNameToDelegate + " not available until after resolve (and refs are bound to real relations)")
      }
    })
  
    p.isSame = p.isEquivalent = function(other) {
      return other.constructor == F &&
             this._relationName == other._relationName
    }
  
    p.inspect = function(){return "*" + this._relationName }
  
    return F
  }()

  knit.NullRelation = function(){
    var F = function() {}; var p = F.prototype
    p.resolve = function(bindings) { return this }
    p.id = function() { return "nullRelation_id" }
    p.attributes = function() { return new knit.Attributes([]) }
    p.attr = function() { throw("Null Relation has no attributes") }
    p.inspect = function() { return "nullRelation" }
    p.merge = function() { return this }
    p.split = function() { return this }
    p.newNestedAttribute = function() { throw("It doesn't make sense for Null Relation to create attributes") }
    p.perform = function() { return this }
    p.isSame = p.isEquivalent = function(other) { return this === other }
    return new F()  
  }()

  knit.AttributeReference = function(){
    var F = function(relationRef, attributeName) {
      this._attribute = new knit.UnresolvedAttributeReference(relationRef, attributeName)
    }; var p = F.prototype
  
    p.resolve = function(bindings) { 
      if (this._attribute.resolve) this._attribute = this._attribute.resolve(bindings) 
      return this
    }
  
    p.name = function() { return this._attribute.name() }
    p.sourceRelation = function() { return this._attribute.sourceRelation() }
    p.isSame = p.isEquivalent = function(other) { return this._attribute.isSame(other) }
    p.inspect = function(){return this._attribute.inspect()}
  
    return F
  }()

  knit.UnresolvedAttributeReference = function(){
    var F = function(relationRef, attributeName) {
      this._relationRef = relationRef
      this._attributeName = attributeName
    }; var p = F.prototype
  
    p.resolve = function(bindings) {
      return this._relationRef.resolve(bindings).attr(this._attributeName)
    }

    p.name = function() { return this._attributeName }
    p.sourceRelation = function() { return this._relationRef }
  
    p.isSame = p.isEquivalent = function(other) {
      return knit.quacksLike(other, knit.signature.attribute) &&
             this.sourceRelation().isSame(other.sourceRelation()) &&
             this.name() == other.name()
    }
  
    p.inspect = function(){return "*" + this._attributeName}
  
    return F
  }()

  knit.NestedAttributeReference = function(){
  
    var F = function(attributeName, nestedAttributes) {
      this._attribute = new knit.UnresolvedNestedAttributeReference(attributeName, nestedAttributes)
    }; var p = F.prototype
  
    p.resolve = function(bindings) { 
      if (this._attribute.resolve)  this._attribute = this._attribute.resolve(bindings) 
      return this
    }
  
    p.name = function() { return this._attribute.name() }
    p.setSourceRelation = function(sourceRelation) { return this._attribute.setSourceRelation(sourceRelation) }
    p.sourceRelation = function() { return this._attribute.sourceRelation() }
    p.nestedRelation = function() { return this._attribute.nestedRelation() }
  
    p.isSame = p.isEquivalent = function(other) {
      return knit.quacksLike(other, knit.signature.attribute) &&
             this._attribute.isSame(other)
    }
  
    p.inspect = function(){return this._attribute.inspect()}
  
    return F
  }()

  knit.UnresolvedNestedAttributeReference = function(){
    var F = function(attributeName, nestedAttributes) {
      this._attributeName = attributeName
      this._nestedAttributes = nestedAttributes
      this._sourceRelation = knit.NullRelation
    }; var p = F.prototype

    p.resolve = function(bindings) { 
      _A.each(this._nestedAttributes, function(nestedAttribute){nestedAttribute.resolve(bindings)})
      return this.sourceRelation().newNestedAttribute(this._attributeName, this._nestedAttributes)
    }
  
    p.name = function() { return this._attributeName }
    p.sourceRelation = function() { return this._sourceRelation }
    p.setSourceRelation = function(sourceRelation) { this._sourceRelation = sourceRelation; return this }
    p.nestedRelation = function() { throw("nestedRelation is not available until after resolve") }
  
    p.isSame = p.isEquivalent = function(other) {
      return knit.quacksLike(other, knit.signature.attribute) &&
             this.sourceRelation().isSame(other.sourceRelation()) &&
             this.name() == other.name()
    }
  
    p.inspect = function(){return "*" + this._attributeName}
  
    return F
  }()


  knit.ReferenceEnvironment = function(){
    var F = function() {
      this._keyToRef = {}
    }; var p = F.prototype
  
    p.relation = function(relationName) {
      var relationRef = this._keyToRef[relationName] = this._keyToRef[relationName] || new knit.RelationReference(relationName)
      return relationRef
    }
  
    function regularAttr(relationNameDotAttributeName) {
      var key = relationNameDotAttributeName
      var parts = relationNameDotAttributeName.split(".")
      var relationRef = this.relation(parts[0])
      var attributeName = parts[1]
      var attributeRef = this._keyToRef[key] = this._keyToRef[key] || new knit.AttributeReference(relationRef, attributeName)
      return attributeRef
    }
  
    function nestedAttr(attributeName, nestedAttributeRefs) {
      var key = attributeName
      var attributeRef = this._keyToRef[key] = this._keyToRef[key] || new knit.NestedAttributeReference(attributeName, nestedAttributeRefs)
      return attributeRef
    }
  
    p.attr = function() {
      var args = _A.toArray(arguments)
    
      if (args.length == 1) {
        var relationNameDotAttributeName = args[0]
        return knit._util.bind(regularAttr, this)(relationNameDotAttributeName)
      } else if (args.length==2 && _.isArray(args[1]) ){
        var attributeName = args[0]
        var nestedAttributeRefs = args[1]
        return knit._util.bind(nestedAttr, this)(attributeName, nestedAttributeRefs)
      } else {
        var self = this
        return _A.map(args, function(relationNameDotAttributeName){return self.attr(relationNameDotAttributeName)})
      }
    }
  
    p.resolve = function(bindings) {
      var self = this
    
      var resolved = []
      _A.each(_.keys(bindings), function(relationKey){
      
        self.relation(relationKey).resolve(bindings)
        resolved.push(relationKey)
      
        _A.each(bindings[relationKey].attributes(), function(attribute){
          var attributeKey = relationKey + "." + attribute.name()
          self.attr(attributeKey).resolve(bindings)
          resolved.push(attributeKey)
        })
      })
    
      var stillToResolve = _A.without.apply(null, [_.keys(this._keyToRef)].concat(resolved))
      _A.each(stillToResolve, function(key){
        self._keyToRef[key].resolve(bindings)
      })
    
      return this
    }
  
    p.decorate = function(target, bindings) {
      target.relation = knit._util.bind(this.relation, this)
      target.attr = knit._util.bind(this.attr, this)
      var resolveF = knit._util.bind(this.resolve, this)
      target.resolve = function(){resolveF(bindings())}
      return target
    }
  
    return F
  }()
})()


//knit/signatures ======================================================
knit.signature = function(){
  var _ = knit._util
  
  var like = {
    isSame:Function, 
    isEquivalent:Function
  }
  
  var signatures = {}
  
  signatures.attribute = _.extend({
    name:Function, 
    sourceRelation:Function}, 
    like
  )
  
  signatures.nestedAttribute = _.extend({
    nestedRelation:Function}, 
    signatures.attribute
  )
  
  signatures.relation = _.extend({
    attributes:Function, 
    split:Function, 
    merge:Function, 
    newNestedAttribute:Function}, 
    like
  )
  
  signatures.join = _.extend({
    relationOne:Object, 
    relationTwo:Object, 
    predicate:Object}, 
    signatures.relation
  )

  return signatures
}()



//knit/dsl_function ======================================================
//see http://alexyoung.org/2009/10/22/javascript-dsl/

global.DSLFunction = (function() {
  var _A = CollectionFunctions.Array.functions,
      _ = knit._util
  
  var dslLocals = {}
  var outerFunction = function(userFunction, what_theKeywordThis_IsSupposedToBe){
    if (what_theKeywordThis_IsSupposedToBe == undefined) {
      what_theKeywordThis_IsSupposedToBe = this
    }
    
    var localNames = []
    var localValues = []
    _A.each(_.keys(dslLocals), function(key){
      localNames.push(key)
      localValues.push(dslLocals[key])
    })
    
    var userFunctionBody = "(knit._util.bind(" + userFunction.toString().replace(/\s+$/, "") + ",this))()"
    var wrappingFunctionBody = "(function(" + localNames.join(",") + "){return " + userFunctionBody + "})"
    return eval(wrappingFunctionBody).apply(what_theKeywordThis_IsSupposedToBe, localValues)
  }
  
  outerFunction.dslLocals = dslLocals
  
  outerFunction.specialize = function(childDslLocals) {
    var allDslLocals = _.extend({}, outerFunction.dslLocals)
    var allDslLocals = _.extend(allDslLocals, childDslLocals)
    var childDslFunction = new DSLFunction()
    _.extend(childDslFunction.dslLocals, allDslLocals)
    return childDslFunction
  }
  
  return outerFunction
})





//knit/builder_function ======================================================

knit.createBuilderFunction = function(setup) {
  var bindings = typeof setup.bindings == "function" ? setup.bindings : function(){return setup.bindings}

  var referenceResolvingWrapper = function() {
    var dslFunction = new DSLFunction()
    knit._util.extend(dslFunction.dslLocals, knit.createBuilderFunction.dslLocals)
    var environment = new knit.ReferenceEnvironment()
    environment.decorate(dslFunction.dslLocals, bindings)

    var result = dslFunction.apply(null, arguments)
    environment.resolve(bindings())
    return result
  }
  return referenceResolvingWrapper
}

knit.createBuilderFunction.dslLocals = {}





//knit/rows_and_objects ======================================================

knit.mixin.RowsAndObjects = function(proto) {
  proto.rows = function(){return this.perform().rows()}
  proto.objects = function(){return this.perform().objects()}
}


//knit/attributes ======================================================

knit.Attributes = function() {
  
  var F = function(attributeArray) {
    this._attributeArray = attributeArray
  }; var p = F.prototype

  var _A = CollectionFunctions.Array.functions
  
  var localCF = CollectionFunctions({
    iterator:function(attributes) { return _A.iterator(attributes._attributeArray)}, 
    nothing:function(){return null}, 
    equals:function(a,b){return a && b && a.isSame && b.isSame && a.isSame(b)},
    newCollection:function(){return new F([])},
    append:function(attributes, attribute){attributes._attributeArray.push(attribute)}
  })
  
  var _O = localCF.functions
  var objectStyleCF = localCF.makeObjectStyleFunctions(function(){return this})
  _A.each(["clone", "concat", "inspect", "without", "map",
           "each", "indexOf", "size", "differ", "empty", "indexOf", "indexesOf"], function(functionName) {
    p[functionName] = objectStyleCF[functionName]
  })
  p.isSame = p.isEquivalent = objectStyleCF.equals
  p.splice = objectStyleCF.splice
  
  p.names = function(){return _O.pluck(this, 'name')}
  p.get = function() { 
    if (arguments.length==1) {
      var name = arguments[0]
      return _O.detect(this, function(attr){return attr.name() == name}) 
    } else {
      var args = _A.toArray(arguments)
      return _O.select(this, function(attr){return _A.include(args, attr.name())}) 
    }
  }
  
  p.spliceInNestedAttribute = function(nestedAttribute) {
    var firstNestedAttributePosition = _O.indexesOf(this, nestedAttribute.nestedRelation().attributes()).sort()[0]
    var withoutAttributesToNest = _O.differ(this, nestedAttribute.nestedRelation().attributes())
    return _O.splice(withoutAttributesToNest, new F([nestedAttribute]), firstNestedAttributePosition)
  }
  
  p.makeObjectFromRow = function(row) {
    var object = {}
    _O.each(this, function(attr, columnPosition) {
      var value = row[columnPosition]
      var propertyName = attr.name()
      if (attr.nestedRelation) {
        object[propertyName] = attr.nestedRelation().objects(value)
      } else {
        object[propertyName] = value
      }
    })
    return object
  }
  
  return F
}()



//knit/algebra/predicate/equality ======================================================

knit.algebra.predicate.Equality = function() {
  var _A = CollectionFunctions.Array.functions
  
  var F = function(leftAtom, rightAtom) {
    this.leftAtom = leftAtom
    this.rightAtom = rightAtom
  }; var p = F.prototype

  p._isAttribute = function(thing) {
    return thing.name && !thing.attributes
  }
  
  p._attributesReferredTo = function() {
    var attributes = []
    if (this._isAttribute(this.leftAtom)) { 
      attributes.push(this.leftAtom)
    } 
    if (this._isAttribute(this.rightAtom)) { 
      attributes.push(this.rightAtom)
    } 
    return new knit.Attributes(attributes)
  }
  
  p._attributesFromRelations = function(relations) {
    var allAttributes = new knit.Attributes([])
    _A.each(relations, function(r){allAttributes = allAttributes.concat(r.attributes())})
    return allAttributes
  }

  p.concernedWithNoOtherRelationsBesides = function() {    
    var expectedExclusiveRelations = _A.toArray(arguments)
    var allAttributes = new knit.Attributes([])
    _A.each(expectedExclusiveRelations, function(r){allAttributes = allAttributes.concat(r.attributes())})
    
    return this._attributesReferredTo().differ(allAttributes).empty()
  }
    
  p.concernedWithAllOf = function() {
    var expectedRelations = _A.toArray(arguments)
    var myAttributes = this._attributesReferredTo()
    
    this._attributesReferredTo().each(function(attr){
      var relationToCheckOff = _A.detect(expectedRelations, function(r){return attr.sourceRelation().isSame(r)})
      if (relationToCheckOff) expectedRelations = _A.without(expectedRelations, relationToCheckOff)
    })

    return _A.empty(expectedRelations)
  }
    

  p._areTheseTwoThingsTheSame = function(a, b) {
    return a.isSame && b.isSame && a.isSame(b) || a == b
  }
  
  p.isSame = function(other) {  
    return other.constructor == F && 
           this._areTheseTwoThingsTheSame(this.leftAtom, other.leftAtom) &&
           this._areTheseTwoThingsTheSame(this.rightAtom, other.rightAtom)
  }
  
  p.isEquivalent = function(other) {
    return this.isSame(other) ||
             other.constructor == F && 
             this._areTheseTwoThingsTheSame(this.leftAtom, other.rightAtom) &&
             this._areTheseTwoThingsTheSame(this.rightAtom, other.leftAtom)
  }

  p._inspectAtom = function(value) {
    if (value.inspect) {
      return value.inspect()
    } else if (typeof value == "string") {
      return "'" + value + "'"
    } else {
      return "" + value
    }
  }
  
  p.inspect = function() { return "eq(" + this._inspectAtom(this.leftAtom) + "," + 
                                          this._inspectAtom(this.rightAtom) + ")" }

  return F
}()

knit.createBuilderFunction.dslLocals.equality = function(leftAtom, rightAtom) {
  return new knit.algebra.predicate.Equality(leftAtom, rightAtom)
}

knit.createBuilderFunction.dslLocals.eq = knit.createBuilderFunction.dslLocals.equality



//knit/algebra/predicate/true_false ======================================================

knit.algebra.predicate.True = function() {
  return new knit.algebra.predicate.Equality(1,1)
}
knit.createBuilderFunction.dslLocals.TRUE = new knit.algebra.predicate.True()

knit.algebra.predicate.False = function() {
  return new knit.algebra.predicate.Equality(1,2)
}
knit.createBuilderFunction.dslLocals.FALSE = new knit.algebra.predicate.False()



//knit/algebra/predicate/conjunction ======================================================

knit.algebra.predicate.Conjunction = function(){
  var _A = CollectionFunctions.Array.functions
  
  var F = function(leftPredicate, rightPredicate) { //har
    this.leftPredicate = leftPredicate
    this.rightPredicate = rightPredicate
  }; var p = F.prototype

  p.concernedWithNoOtherRelationsBesides = function() {
    var expectedExclusiveRelations = _A.toArray(arguments)
    return this.leftPredicate.concernedWithNoOtherRelationsBesides.apply(this.leftPredicate, expectedExclusiveRelations) &&
           this.rightPredicate.concernedWithNoOtherRelationsBesides.apply(this.rightPredicate, expectedExclusiveRelations)
  }
  
  p.concernedWithAllOf = function() {
    var expectedRelations = _A.toArray(arguments)
  
    var self = this
    var remainingRelations = _A.select(expectedRelations, function(relation){
      return ! (self.leftPredicate.concernedWithAllOf(relation) || self.rightPredicate.concernedWithAllOf(relation))
    })

    return _A.empty(remainingRelations)
  }
      
  p.isSame = function(other) {
    return other.constructor == F && 
           this.leftPredicate.isSame(other.leftPredicate) &&
           this.rightPredicate.isSame(other.rightPredicate)
  }
  
  p.isEquivalent = function(other) {
    return this.isSame(other) ||
             other.constructor == F && 
             this.leftPredicate.isEquivalent(other.rightPredicate) &&
             this.rightPredicate.isEquivalent(other.leftPredicate)
  }
  
  p.inspect = function() { return "and(" + this.leftPredicate.inspect() + "," + 
                                           this.rightPredicate.inspect() + ")" }
  
  return F
}()

knit.createBuilderFunction.dslLocals.conjunction = function(leftPredicate, rightPredicate) {
  return new knit.algebra.predicate.Conjunction(leftPredicate, rightPredicate)
}

knit.createBuilderFunction.dslLocals.and = knit.createBuilderFunction.dslLocals.conjunction



//knit/algebra/predicate ======================================================



//knit/algebra/join ======================================================

knit.algebra.Join = function(){

  var F = function(relationOne, relationTwo, predicate) {
    this.relationOne = relationOne
    this.relationTwo = relationTwo
    this.predicate = predicate || new knit.algebra.predicate.True()
  }; var p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.newNestedAttribute = function() {    
    return this.relationOne.newNestedAttribute.apply(this.relationOne, arguments)
  }
  
  p.perform = function() {
    return this.relationOne.perform().performJoin(this.relationTwo.perform(), this.predicate)
  }

  p.attributes = function(){ return this.relationOne.attributes().concat(this.relationTwo.attributes()) }
  
  p._predicateIsDefault = function() {
    return this.predicate.isSame(new knit.algebra.predicate.True())
  }
  
  p.appendToPredicate = function(additionalPredicate) {
    if (this._predicateIsDefault()) {
      this.predicate = additionalPredicate
    } else {
      this.predicate = new knit.algebra.predicate.Conjunction(this.predicate, additionalPredicate)
    }
    return this
  }

  p.isSame = function(other) {
    return other.constructor == F && 
           this.relationOne.isSame(other.relationOne) &&
           this.relationTwo.isSame(other.relationTwo) &&
           this.predicate.isSame(other.predicate)
  }
 
  p.isEquivalent = function(other) {
    return this.isSame(other) ||
             other.constructor == F && 

             ((this.relationOne.isSame(other.relationOne) &&
              this.relationTwo.isSame(other.relationTwo)) ||

             (this.relationOne.isSame(other.relationTwo) &&
              this.relationTwo.isSame(other.relationOne))) &&

             this.predicate.isEquivalent(other.predicate)
  }
  
  p.split = p.merge = function(){return this}
  
  p.inspect = function(){
    var inspectStr = "join(" + this.relationOne.inspect() + "," + this.relationTwo.inspect()
  
    if (!this._predicateIsDefault()) {
      inspectStr += "," + this.predicate.inspect()
    }
  
    inspectStr += ")"
    return inspectStr
  }

  return F
}()

knit.createBuilderFunction.dslLocals.join = function(relationOne, relationTwo, predicate) { 
  return new knit.algebra.Join(relationOne, relationTwo, predicate) 
}


knit.algebra.LeftOuterJoin = function(relationOne, relationTwo, predicate) {
  var join = new knit.algebra.Join(relationOne, relationTwo, predicate)
  join.perform = function() {
    return this.relationOne.perform().performLeftOuterJoin(this.relationTwo.perform(), this.predicate)
  }
  return join
}

knit.createBuilderFunction.dslLocals.leftOuterJoin = function(relationOne, relationTwo, predicate) { 
  return new knit.algebra.LeftOuterJoin(relationOne, relationTwo, predicate) 
}



knit.algebra.RightOuterJoin = function(relationOne, relationTwo, predicate) {
  var join = new knit.algebra.Join(relationOne, relationTwo, predicate)
  join.perform = function() {
    return this.relationOne.perform().performRightOuterJoin(this.relationTwo.perform(), this.predicate)
  }
  return join
}

knit.createBuilderFunction.dslLocals.rightOuterJoin = function(relationOne, relationTwo, predicate) { 
  return new knit.algebra.RightOuterJoin(relationOne, relationTwo, predicate) 
}



knit.algebra.NaturalJoin = function(relationOne, relationTwo) {
  var _A = CollectionFunctions.Array.functions
  
  var join = new knit.algebra.Join(relationOne, relationTwo, new knit.algebra.predicate.True())

  join.perform = function() {
    var commonAttributeNames = _A.intersect(this.relationOne.attributes().names(), 
                                            this.relationTwo.attributes().names())
    var commonIdAttributeNames = _A.select(commonAttributeNames, function(attributeName){return attributeName.match(/Id$/)})

    function attributeNamesToPredicate(attributeNames, relationOne, relationTwo) {
      if (attributeNames.length == 1) {
        var attributeName = attributeNames.shift()
        return new knit.algebra.predicate.Equality(relationOne.attr(attributeName), relationTwo.attr(attributeName))
      } else if (attributeNames.length > 1) {
        var attributeOne = attributeNames.shift()
        return new knit.algebra.predicate.Conjunction(attributeNamesToPredicate([attributeOne], relationOne, relationTwo), 
                                                      attributeNamesToPredicate(attributeNames, relationOne, relationTwo))
      } else {
        return new knit.algebra.predicate.True()
      }
    }

    var predicate = attributeNamesToPredicate(commonIdAttributeNames, this.relationOne, this.relationTwo)
    
    return this.relationOne.perform().performRightOuterJoin(this.relationTwo.perform(), predicate)
  }

  return join
}

knit.createBuilderFunction.dslLocals.naturalJoin = function(relationOne, relationTwo) { 
  return new knit.algebra.NaturalJoin(relationOne, relationTwo) 
}



//knit/algebra/select ======================================================

knit.algebra.Select = function() {
  var _A = CollectionFunctions.Array.functions
  
  var F = function(relation, criteria) {
    this.relation = relation
    this.criteria = criteria
  }; var p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.perform = function() { return this.relation.perform().performSelect(this.criteria) }

  p.attributes = function(){ return this.relation.attributes() }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }
  
  p.merge = function() {
    if (this.relation.criteria) {
      return new F(this.relation.relation.merge(), new knit.algebra.predicate.Conjunction(this.relation.criteria, this.criteria))
    } else {
      return this
    }
  }
  
  p.split = function() {
    if (this.criteria.constructor == knit.algebra.predicate.Conjunction) {
        return new F(
          new F(this.relation.split(), this.criteria.leftPredicate),
          this.criteria.rightPredicate
        )
    } else {
      return this
    }
  }
  
  p._doPush = function(relation) { return new F(relation, this.criteria).push() }
  
  p.push = function() {
    if (knit.quacksLike(this.relation, knit.signature.join)) {
      var join = this.relation
      if (this.criteria.concernedWithNoOtherRelationsBesides(join.relationOne)) {
        join.relationOne = this._doPush(join.relationOne)
        return join
      } else if (this.criteria.concernedWithNoOtherRelationsBesides(join.relationTwo)) {
        join.relationTwo = this._doPush(join.relationTwo)
        return join
      } else if (this.criteria.concernedWithNoOtherRelationsBesides(join.relationOne, join.relationTwo) &&
                 this.criteria.concernedWithAllOf(join.relationOne, join.relationTwo)) {
        join.appendToPredicate(this.criteria)
        return join
      } else {
        return this
      }
    } else if (this.relation.push) {
      var innerPushResult = this.relation.push()
      if (innerPushResult===this.relation) { //bounce
        // me(
        //   you(
        //     yourRelation,
        //    [yourStuff]
        //   ),
        //  [myStuff]
        // )
        
        //becomes
        
        // you(
        //   me(
        //     yourRelation,
        //    [yourStuff]
        //   ),
        //  [myStuff]
        // )
        
        var me = this
        
        var you = this.relation
        var yourRelation = this.relation.relation
        
        me.relation = yourRelation
        you.relation = me.push()
        
        return you
      } else {
        this.relation = innerPushResult
        return this.push()
      }
    } else {
      return this
    }
  }
  
  p.isSame = function(other) {
    return other.constructor == F && 
           this.relation.isSame(other.relation) &&
           this.criteria.isSame(other.criteria)
  }
  
  p.isEquivalent = function(other) {
    if (other.constructor == F) {
      var thisMerged = this.merge()
      var otherMerged = other.merge()
    
      return thisMerged.isSame(otherMerged) ||
               thisMerged.relation.isEquivalent(otherMerged.relation) &&
               thisMerged.criteria.isEquivalent(otherMerged.criteria)
    } else {
      return false
    }
  }
  
  p.inspect = function(){return "select(" + this.relation.inspect() + "," + 
                                            this.criteria.inspect() + ")"}
  
  return F
}()

knit.createBuilderFunction.dslLocals.select = function(relation, criteria) {
  return new knit.algebra.Select(relation, criteria)
}



//knit/algebra/project ======================================================

//proh JEKT
knit.algebra.Project = function() {

  var F = function(relation, attributes) {
    this._attributes = attributes
    this.relation = relation
  }; var p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.perform = function() { return this.relation.perform().performProject(this.attributes()) }

  p.attributes = function(){ return this._attributes }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }

  p.isSame = p.isEquivalent = function(other) {
    return other.constructor == F && 
           this.relation.isSame(other.relation) &&
           this.attributes().isSame(other.attributes())
  }
  
  p.inspect = function(){return "project(" + this.relation.inspect() + "," + 
                                "[" + this.attributes().inspect() + "])"}

  return F
}()


knit.createBuilderFunction.dslLocals.project = function(relation, attributes) {
  return new knit.algebra.Project(relation, new knit.Attributes(attributes))
}


//knit/algebra/order ======================================================

knit.algebra.Order = function(){
  
  var F = function(relation, orderAttribute, direction) {
    this.relation = relation
    this.orderAttribute = orderAttribute
    this.direction = direction
  }; var p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.perform = function() {
    return this.relation.perform().performOrder(this.orderAttribute, this.direction)
  }

  p.attributes = function(){ return this.relation.attributes() }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }
  
  p.isSame = p.isEquivalent = function(other) {
    return other.constructor == F && 
           this.relation.isSame(other.relation) &&
           this.orderAttribute.isSame(other.orderAttribute) &&
           this.direction == other.direction
  }
  
  p.inspect = function(){return "order." + this.direction + 
                                  "(" + this.relation.inspect() + "," + 
                                        this.orderAttribute.inspect() + ")"}
  
  F.ASC = "asc"
  F.DESC = "desc"
  
  return F
}()

knit.createBuilderFunction.dslLocals.order = {
  asc: function(relation, orderAttribute) { return new knit.algebra.Order(relation, orderAttribute, knit.algebra.Order.ASC) },
  desc: function(relation, orderAttribute) { return new knit.algebra.Order(relation, orderAttribute, knit.algebra.Order.DESC) }
}





//knit/algebra/nest_unnest ======================================================

knit.algebra.Unnest = function(){

  var F = function(relation, nestedAttribute) {
    this.relation = relation
    this.nestedAttribute = nestedAttribute
  }; var p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.perform = function() {
    return this.relation.perform().performUnnest(this.nestedAttribute)
  }  

  p.attributes = function(){ return this.relation.attributes() }
  
  p.isSame = p.isEquivalent = function(other) {
    return other.constructor == F && 
           this.relation.isSame(other.relation) &&
           this.nestedAttribute.isSame(other.nestedAttribute)
  }
  
  p.inspect = function(){return "unnest(" + this.relation.inspect() + "," + 
                                            this.nestedAttribute.inspect() + ")"}
  
  return F
}()

knit.createBuilderFunction.dslLocals.unnest = function(relation, nestedAttribute) { 
  return new knit.algebra.Unnest(relation, nestedAttribute) 
}

knit.algebra.Nest = function(){

  var F = function(relation, nestedAttribute) {
    this.relation = relation
    this.nestedAttribute = nestedAttribute
    this.nestedAttribute.setSourceRelation(relation)
  }; var p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.perform = function() {
    //impose order for now
    var relation = this.relation
    this.attributes().without(this.nestedAttribute).each(function(orderByAttr){
      relation = new knit.algebra.Order(relation, orderByAttr, knit.algebra.Order.ASC)
    })
    return relation.perform().performNest(this.nestedAttribute, this.attributes())
  }
  
  p.attributes = function(){ 
    return this.relation.attributes().spliceInNestedAttribute(this.nestedAttribute)
  }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }
  
  p.isSame = p.isEquivalent = function(other) {
    return other.constructor == F && 
           this.relation.isSame(other.relation) &&
           this.nestedAttribute.isSame(other.nestedAttribute)
  }
  
  p.inspect = function(){return "nest(" + this.relation.inspect() + "," + this.nestedAttribute.inspect() + ")"}

  return F
}()

knit.createBuilderFunction.dslLocals.nest = function(relation, nestedAttribute) {
  return new knit.algebra.Nest(relation, nestedAttribute)
}







//knit/engine/memory ======================================================

knit.engine.Memory = function() {
}

knit.engine.Memory.prototype.createRelation = function(name, attributeNames, primaryKey) {
  return new knit.engine.Memory.MutableRelation(name, attributeNames, primaryKey)
}




//knit/engine/memory/attribute ======================================================
knit.engine.Memory.Attribute = function(){

  var F = function(name, sourceRelation) {
    this._name = name
    this._sourceRelation = sourceRelation
  }; var p = F.prototype

  p.name = function() { return this._name }
  p.sourceRelation = function() { return this._sourceRelation }
  p.isSame = function(other) {
    return knit.quacksLike(other, knit.signature.attribute) &&
           this.name() == other.name() &&
           this.sourceRelation().id() == other.sourceRelation().id()
  }
  p.isEquivalent = p.isSame
  
  p.inspect = function() {
    return this.name()
  }
  
  return F
}()

knit.engine.Memory.NestedAttribute = function(){

  var F = function(name, nestedRelation, sourceRelation) {
    this._name = name
    this._nestedRelation = nestedRelation
    this._sourceRelation = sourceRelation
  }; var p = F.prototype
  
  p.name = function() { return this._name }
  p.sourceRelation = function() { return this._sourceRelation }
  p.nestedRelation = function() { return this._nestedRelation }
  p.isSame = function(other) {
    return knit.quacksLike(other, knit.signature.nestedAttribute) &&
           this.name() == other.name() &&
           this.nestedRelation().id() == other.nestedRelation().id()
  }
  p.isEquivalent = p.isSame
  
  p.inspect = function() {
    return this.name() + ":" + this.nestedRelation().inspect()
  }
  
  return F
}()



//knit/engine/memory/relation ======================================================
knit.engine.Memory.Relation = function() {
  
  var _A = CollectionFunctions.Array.functions,
      _ = knit._util
  
  var _id = 0
  
  var F = function(name, attributeNames, primaryKey, rows, costSoFar) {
    _id += 1
    this._id = "memory_" + _id + "_" + name
    this._name = name
    var self = this
    
    if (attributeNames.constructor == knit.Attributes) {
      this._attributes = attributeNames //confusingly enough...
    } else {
      var attributes = []
      var self = this
      _A.each(attributeNames, function(attr){
        var attrToAdd = null
        if (attr.name) {
          attrToAdd = attr
        } else if (typeof attr == "string") {
          var attributeName = attr
          attrToAdd = new knit.engine.Memory.Attribute(attributeName, self)
        } else {
          var attributeName = _.keys(attr)[0]
          var nestedRelation = _.values(attr)[0]
          attrToAdd = new knit.engine.Memory.NestedAttribute(attributeName, nestedRelation, self)
        }
    
        attributes.push(attrToAdd)
      })      
      this._attributes = new knit.Attributes(attributes)
    }
    
    this._pkAttributeNames = primaryKey || []
    var pkPositions = _A.indexesOf(this._attributes.names(), this._pkAttributeNames)

    this._rowStore = new knit.engine.Memory.StandardRowStore(pkPositions, rows || [])
    this.cost = costSoFar || 0
  }; var p = F.prototype

  p.id = function(){ return this._id }
  p.name = function(){ return this._name }
  p.attributes = function(){ return this._attributes }
  p.attr = function() { return this.attributes().get(_A.toArray(arguments)) }
  p.split = function(){return this}
  p.merge = function(){return this}
  p.perform = function() { return this }
  p.rows = function() { return this._rowStore.rows() }
  p.objects = function(rows) {
    rows = rows || this.rows()
    var attributes = this.attributes()
    return _A.map(rows, function(row){return attributes.makeObjectFromRow(row)})
  }
  
  p.isSame = function(other) { return other.id && this.id() == other.id() }
  p.isEquivalent = function(other) {
    return knit.quacksLike(other, knit.signature.relation) &&
           this.attributes().isEquivalent(other.attributes())
  }
  
  p.inspect = function() { return this.name() + "[" + this.attributes().inspect() + "]" }
  
  
  p._newRelation = function(rows, name, attributes) {
    var newName = name || this.name()
    var newAttributes = attributes || this.attributes()
    
    //curry?
    return new knit.engine.Memory.Relation(newName, newAttributes, this._pkAttributeNames, rows, this.cost + rows.length) 
  }
  
  p.newNestedAttribute = function(attributeName, attributesToNest) {
    var nestedRelation = new knit.engine.Memory.Relation("(nested)", attributesToNest, [], [], 0) 
    return new knit.engine.Memory.NestedAttribute(attributeName, nestedRelation, this)
  }

  
  
  
  p.performSelect = function(criteria) {
    var attributes = this.attributes()
    var matchingRows = _A.select(this.rows(), function(row){return criteria.match(attributes, row)})        
    return this._newRelation(matchingRows) 
  }
  
  p.performProject = function(keepAttributes) {
    var positionsToKeep = this.attributes().indexesOf(keepAttributes)
    var projectedRows = _A.map(this.rows(), function(row) {
      return _A.map(positionsToKeep, function(position) {
        return row[position]
      })
    })
    return this._newRelation(projectedRows, this.name(), keepAttributes) 
  }

  function joinRows(combinedAttributes, outerRows, innerRows, predicate, candidateJoinRowFunction, 
                    innerAttributes, noInnerMatchFoundFunction) {
    var resultRows = []
    
    _A.each(outerRows, function(outerRow){
      var innerRowMatchFound = false
      _A.each(innerRows, function(innerRow){
        var candidateJoinRow = candidateJoinRowFunction(outerRow, innerRow) 
        if (predicate.match(combinedAttributes, candidateJoinRow)) {
          resultRows.push(candidateJoinRow)
          innerRowMatchFound = true
        }
      })
      
      if ( noInnerMatchFoundFunction && ! innerRowMatchFound) {
        noInnerMatchFoundFunction(innerAttributes, outerRow, resultRows)
      }
    })

    return resultRows
  }


  p.performJoin = function(relationTwo, predicate) {
    var combinedAttributes = this.attributes().concat(relationTwo.attributes())           
    return this._newRelation(
      joinRows(
        combinedAttributes,
        this.rows(),
        relationTwo.rows(),
        predicate,
        function(leftRow, rightRow){return [].concat(leftRow).concat(rightRow)}
      ), 
      this.name() + "__" + relationTwo.name(), 
      combinedAttributes)
  }

  p.performLeftOuterJoin = function(relationTwo, predicate) {
    var combinedAttributes = this.attributes().concat(relationTwo.attributes())           
    return this._newRelation(
      joinRows(
        combinedAttributes,
        this.rows(),
        relationTwo.rows(),
        predicate,
        function(leftRow, rightRow){return [].concat(leftRow).concat(rightRow)},
        relationTwo.attributes(),
        function(rightAttributes, leftRow, joinRows){
          var rightAsNulls = _A.repeat([null], rightAttributes.size())
          var leftRowWithNullRightValues = [].concat(leftRow).concat(rightAsNulls)
          joinRows.push(leftRowWithNullRightValues)
        }
      ), 
      this.name() + "__" + relationTwo.name(), 
      combinedAttributes)
  }

  p.performRightOuterJoin = function(relationTwo, predicate) {
    var combinedAttributes = this.attributes().concat(relationTwo.attributes())           
    return this._newRelation(
      joinRows(
        combinedAttributes,
        relationTwo.rows(),
        this.rows(),
        predicate,
        function(rightRow, leftRow){return [].concat(leftRow).concat(rightRow)},
        this.attributes(),
        function(leftAttributes, rightRow, joinRows){
          var leftAsNulls = []
          var leftAsNulls = _A.repeat([null], leftAttributes.size())
          var rightRowWithNullLeftValues = [].concat(leftAsNulls).concat(rightRow)
          joinRows.push(rightRowWithNullLeftValues)
        }
      ), 
      this.name() + "__" + relationTwo.name(), 
      combinedAttributes)
  }

  p.performOrder = function(orderAttribute, direction) {
    var columnNumber = this.attributes().indexOf(orderAttribute)
    var sortedRows = _A.sortBy(this.rows(), function(row){ return row[columnNumber] });
    if (direction == knit.algebra.Order.DESC) sortedRows.reverse()
    return this._newRelation(sortedRows) 
  }

  p.performUnnest = function(nestedAttribute) {
    var nestedAttributeIndex = this.attributes().indexOf(nestedAttribute)
    var newAttributes = this.attributes().splice(nestedAttribute.nestedRelation().attributes(), nestedAttributeIndex, 1)

    var unnestedRows = []

    _A.each(this.rows(), function(row) {
      var nestedRows = row[nestedAttributeIndex]
      _A.each(nestedRows, function(nestedRow){
        unnestedRows.push(_A.splice(row, nestedRow, nestedAttributeIndex, 1))
      })
    })
    return this._newRelation(unnestedRows, this.name(), newAttributes) 
  }
  
  p.performNest = function(nestedAttribute, newAttributeArrangement) {
    //assumption: this relation is ordered by all non-nested attributes.  
    //note that for now this is guaranteed by nest.perform.
    var self = this
    
    var oldNestedPositions = this.attributes().indexesOf(nestedAttribute.nestedRelation().attributes())
    var oldFlatPositions = this.attributes().indexesOf(newAttributeArrangement.without(nestedAttribute))
  
    var newFlatAttrPositionToOldFlatAttrPosition = {}
    newAttributeArrangement.each(function(newAttr, newPosition){
      if (!newAttr.isSame(nestedAttribute)) {
        var oldFlatPosition = self.attributes().indexOf(newAttr)
        newFlatAttrPositionToOldFlatAttrPosition[newPosition] = oldFlatPosition
      }
    })
    
    var nestedAttributePosition = newAttributeArrangement.indexOf(nestedAttribute)

    var newRows = []
    
    var currentNewRow = null
    var currentFlatValues = null
    _A.each(this.rows(), function(row) {
      var flatValuesForThisRow = _A.get(row, oldFlatPositions)
      var nestedValuesForThisRow = _A.get(row, oldNestedPositions)
      var allValuesAreNull = !(_A.detect(nestedValuesForThisRow, function(value){return value != null}))
      
      if (currentFlatValues!=null && _A.equals(flatValuesForThisRow, currentFlatValues)) {
        if ( ! allValuesAreNull) currentNewRow[nestedAttributePosition].push(nestedValuesForThisRow)
      } else {
        if (currentNewRow) newRows.push(currentNewRow)
        
        currentNewRow = newAttributeArrangement.map(function(attr, newPos){
          if (newPos == nestedAttributePosition) {
            return allValuesAreNull ? [] : [nestedValuesForThisRow]
          } else {
            var oldPos = newFlatAttrPositionToOldFlatAttrPosition[newPos]
            return row[oldPos]
          }
        })
        
        currentFlatValues = flatValuesForThisRow
      }
    })
    
    if (currentNewRow) newRows.push(currentNewRow)
    
    return this._newRelation(newRows, this.name(), newAttributeArrangement) 
  }

  return F
}()

knit.engine.Memory.MutableRelation = function(name, attributeNames, primaryKey) {
  var result = new knit.engine.Memory.Relation(name, attributeNames, primaryKey)
  _.extend(result, {
    merge: function(rowsToAdd) {
      this._rowStore.merge(rowsToAdd)
      return this
    }
  })
  return result
}



//knit/engine/memory/predicate ======================================================
knit.algebra.predicate.True.prototype.match = function(attributes, row) {
  return true
}

knit.algebra.predicate.False.prototype.match = function(attributes, row) {
  return false
}

;(function(F){
  function getValue(atom, attributes, row) {
    return knit.quacksLike(atom, knit.signature.attribute) ? row[attributes.indexOf(atom)] : atom
  }

  F.prototype.match = function(attributes, row) {
    var left = getValue(this.leftAtom, attributes, row)
    var right = getValue(this.rightAtom, attributes, row)
    return left == right
  }
  
})(knit.algebra.predicate.Equality)

knit.algebra.predicate.Conjunction.prototype.match = function(attributes, row) {
  return this.leftPredicate.match(attributes, row) && this.rightPredicate.match(attributes, row)
}  



//knit/engine/memory/standard_row_store ======================================================
knit.engine.Memory.StandardRowStore = function(){
  var _A = CollectionFunctions.Array.functions
  
  var F = function(keyColumns, initialRows) {
    this._keyColumns = keyColumns
    this._rows = initialRows || []
  }; var p = F.prototype

  p.merge = function(moreRows) {
    
    var self = this
    
    function hasKey() {
      return self._keyColumns.length >= 1
    }
    
    function treatAsSet(moreRows) {
      //pretty bad perf...
        //future...cost-aware array?
        //test-drive to lower cost...
        //this._rows.with(function(arr){
        //   ...tracks cost of all iterating you do in here  
        //})
        //
        //Also, cost-aware map
          //check out js map
      var keyToRow = {}
      var keyToArrayIndex = {}
      
      _A.each(self._rows, function(row, i){
        var key = _A.map(self._keyColumns, function(arrayIndex){return "" + row[arrayIndex]}).join("_")
        keyToRow[key] = row
        keyToArrayIndex[key] = i
      })
    
      _A.each(moreRows, function(newRow){
        var newKey = _A.map(self._keyColumns, function(arrayIndex){return "" + newRow[arrayIndex]}).join("_")
        if (keyToRow[newKey]) {
          var i = keyToArrayIndex[newKey]
          self._rows[i] = newRow
        } else {
          self._rows.push(newRow)
        }
      })
    }
    
    if (hasKey()) {
      treatAsSet(moreRows)
    } else {
      self._rows = self._rows.concat(moreRows)
    }
  },
  
  p.rows = function(){ return this._rows }
  
  return F
}()









