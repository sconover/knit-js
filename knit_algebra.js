

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
        iteratorHolder._callsToNextSession = 0
        iteratorHolder._callsToNextTotal = 0
        var wrappedFunctions = {}
        
        function makeCostResettingWrapper(inner) {
          return function() {
            iteratorHolder._callsToNextSession = 0
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
            iteratorHolder._callsToNextSession += 1
            iteratorHolder._callsToNextTotal += 1
            return realNext()
          }
          return realIterator
        }
        
        wrappedFunctions.lastCost = function() { return iteratorHolder._callsToNextSession }
        wrappedFunctions.totalCost = function() { return iteratorHolder._callsToNextTotal }
        wrappedFunctions.resetTotalCost = function() { iteratorHolder._callsToNextTotal = 0 }
        
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


//knit/core ======================================================



//knit/namespace ======================================================
if (typeof global === 'undefined') throw new Error("Please define global.  If you are in a browser, set global=window.")

global.knit = {
  algebra: {predicate:{}},
  mixin:{},
  translation:{sql:{}},
  engine:{ memory:{}, sqlite:{} },
  attributeType:{}
}


//knit/core/util ======================================================
//internal utilities
knit._util = {

  //see http://fitzgeraldnick.com/weblog/39/
  quacksLike: function(object, signature) {
    if (typeof signature === "undefined") throw("no signature provided")
    if (object === undefined) return false

    var k, ctor
    for ( k in signature ) {
      ctor = signature[k]
      if ( ctor === Number ) {
        if ( Object.prototype.toString.call(object[k]) !== "[object Number]" || isNaN(object[k]) ) {
          return false
        }
      } else if ( ctor === String ) {
        if ( Object.prototype.toString.call(object[k]) !== "[object String]" ) {
          return false
        }
      } else if ( ctor === Boolean ) {
        var value = object[k]
        if (!(value === true || value === false)) return false
      } else if ( ! (object[k] instanceof ctor) ) {
        return false
      }
    }
    return true
  },
      
  bind: function(f, objectThatShouldBeThis) {
    return function() {
      var args = knit._util.toArray(arguments)
      return f.apply(objectThatShouldBeThis, args)
    }
  },
  
  extend: function() {
    
    //chicken and egg
    var args = []
    for (var i=0; i<arguments.length; i++) {
      args.push(arguments[i])
    }
    
    var mergee = args.shift(),
        toMerges = args
    
    for (i=0; i<toMerges.length; i++) {
      var toMerge = toMerges[i]
      for(var k in toMerge) mergee[k] = toMerge[k]
    }

    return mergee
  },
  
  delegate: function(object, signature, delegateFunction) {
    knit._util.each(knit._util.keys(signature), function(methodNameToDelegate) {
      object[methodNameToDelegate] = function() {
        var target = delegateFunction.apply(this, []),
            targetFunction = target[methodNameToDelegate]
        if (typeof targetFunction != "function") {
          throw(methodNameToDelegate + " not an available function on delegate.")
        }
        return targetFunction.apply(target, arguments) 
      }
    })
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
    return Object.prototype.toString.apply(thing) == "[object Array]"
  },
  
  deepEqual:function(a,b,equalsMethodName) {
    function objectsEqual(objA, objB, equalsMethodName) {
      for (var key in objA) if (!(key in objB) || !knit._util.deepEqual(objA[key], objB[key], equalsMethodName)) return false
      return true
    }
    
    if (a===b) return true
    if (typeof a != typeof b) return false
    if ((a===null || b===null) && a!=b) return false
    if (this.isArray(a) && this.isArray(b)) {
      if (a.length != b.length) return false

      var i = a.length
      while (i--) { if ( ! knit._util.deepEqual(a[i], b[i], equalsMethodName)) return false } //hrm
    } else {      
      if (a[equalsMethodName] && b[equalsMethodName]) {
        if (!a[equalsMethodName](b)) return false
      } else if (typeof a == "object" && typeof b == "object") {
        if (!objectsEqual(a, b, equalsMethodName) || !objectsEqual(b, a, equalsMethodName)) return false //inefficient
      } else {
        if (a!=b) return false
      }
    }
    return true
  },
  
  deepSame:function(a,b) { return knit._util.deepEqual(a,b, "isSame") },
  deepSameThisVsOther:function(other) { return knit._util.deepSame(this, other) }
  
}

knit._util.extend(knit._util, CollectionFunctions.Array.functions)


//knit/core/signatures ======================================================
knit.signature = (function(){
  var _ = knit._util
  
  var inspectable = {inspect:Function},
      like = {isSame:Function, isEquivalent:Function},
      signatures = {}
  
  signatures.attribute = _.extend(
    {name:Function, type:Function, sourceRelation:Function}, 
    like,
    inspectable
  )
  
  signatures.nestedAttribute = _.extend(
    {nestedRelation:Function}, 
    signatures.attribute
  )
  
  signatures.relation = _.extend(
    {attributes:Function, split:Function, merge:Function, newNestedAttribute:Function}, 
    like,
    inspectable
  )
  
  signatures.relationExpression = _.extend(
    {defaultCompiler:Function, compile:Function}, 
    signatures.relation
  )
  
  signatures.compiledRelation = _.extend(
    {rows:Function, objects:Function, cost:Function}, 
    signatures.relation
  )
  
  signatures.executionStrategy = _.extend(
    {rowsAsync:Function, rowsSync:Function}, 
    signatures.relation
  )
  
  signatures.join = _.extend(
    {relationOne:Object, relationTwo:Object, predicate:Object}, 
    signatures.relation
  )
  
  signatures.rawRelation = {attributes:Array, rows:Array}
  

  return signatures
})()



//knit/core/reference ======================================================
knit.RelationReference = (function(){
  
  var _ = knit._util,
      C = function(relationName) {
            this._relation = new knit.UnresolvedRelationReference(relationName)
          },
      p = C.prototype

  p.resolve = function(bindings) { 
    if (this._relation.resolve) this._relation = this._relation.resolve(bindings) 
    return this
  }

  _.each(["id", "attr", "name"], function(methodNameToDelegate) {
    p[methodNameToDelegate] = function() { 
      return this._relation[methodNameToDelegate].apply(this._relation, arguments) 
    }
  })
  
  _.delegate(p, 
             _.extend({}, knit.signature.compiledRelation, knit.signature.relationExpression), 
             function(){return this._relation})
  
  p.isSame = 
    p.isEquivalent = function(other) { 
      return this._relation.isSame(other) || !!(other._relation && this._relation.isSame(other._relation))
    }

  return C
})()

knit.UnresolvedRelationReference = (function(){
  
  var _ = knit._util,
      _id = 0,
      C = function(relationName) {
            this._relationName = relationName
            _id += 1
            this._id = "unresolvedRelation_" + _id
          },
      p = C.prototype

  p.id = function(bindings) { return this._id }
  p.resolve = function(bindings) { return bindings[this._relationName] }
  
  _.each(["attributes", "attr", "merge", "split", "newNestedAttribute"], function(methodNameToDelegate) {
    p[methodNameToDelegate] = function() { 
      throw(methodNameToDelegate + " not available until after resolve (and refs are bound to real relations)")
    }
  })

  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == C &&
             this._relationName == other._relationName
    }

  p.inspect = function(){return "*" + this._relationName }

  return C
})()

knit.NullRelation = (function(){
  var C = function() {},
      p = C.prototype
  p.resolve = function(bindings) { return this }
  p.id = function() { return "nullRelation_id" }
  p.attributes = function() { return new knit.Attributes([]) }
  p.attr = function() { throw("Null Relation has no attributes") }
  p.inspect = function() { return "nullRelation" }
  p.merge = 
    p.split = function() { return this }
  p.newNestedAttribute = function() { throw("It doesn't make sense for Null Relation to create attributes") }
  p.isSame = 
    p.isEquivalent = function(other) { return this === other }
  return new C()  
})()

knit.AttributeReference = (function(){
  
  var C = function(relationRef, attributeName) {
            this._attribute = new knit.UnresolvedAttributeReference(relationRef, attributeName)
          },
      p = C.prototype

  p.resolve = function(bindings) { 
    if (this._attribute.resolve) this._attribute = this._attribute.resolve(bindings) 
    return this
  }

  p.name = function() { return this._attribute.name() }
  p.fullyQualifiedName = function() { return this._attribute.fullyQualifiedName() }
  p.structuredName = function() { return this._attribute.structuredName() }
  p.type = function() { return this._attribute.type() }
  p.sourceRelation = function() { return this._attribute.sourceRelation() }
  p.isSame = 
    p.isEquivalent = function(other) { return this._attribute.isSame(other) }
  p.inspect = function(){return this._attribute.inspect()}

  return C
})()

knit.UnresolvedAttributeReference = (function(){
  
  var _ = knit._util,
      C = function(relationRef, attributeName) {
            this._relationRef = relationRef
            this._attributeName = attributeName
          },
      p = C.prototype

  p.resolve = function(bindings) {
    return this._relationRef.resolve(bindings).attr(this._attributeName)
  }

  p.name = function() { return this._attributeName }
  p.fullyQualifiedName = function() { return this._attributeName }
  p.structuredName = function() { return this._attributeName }
  p.type = function() { return null }
  p.sourceRelation = function() { return this._relationRef }

  p.isSame = 
    p.isEquivalent = function(other) {
      return _.quacksLike(other, knit.signature.attribute) &&
             this.sourceRelation().isSame(other.sourceRelation()) &&
             this.name() == other.name()
    }

  p.inspect = function(){return "*" + this._attributeName}

  return C
})()

knit.NestedAttributeReference = (function(){
  
  var _ = knit._util,
      C = function(attributeName, nestedAttributes) {
            this._attribute = new knit.UnresolvedNestedAttributeReference(attributeName, nestedAttributes)
          },
      p = C.prototype

  p.resolve = function(bindings) { 
    if (this._attribute.resolve)  this._attribute = this._attribute.resolve(bindings) 
    return this
  }

  p.name = function() { return this._attribute.name() }
  p.structuredName = function() { return this._attribute.structuredName() }
  p.fullyQualifiedName = function() { return this._attribute.fullyQualifiedName() }
  p.type = function() { return knit.attributeType.Nested }
  p.setSourceRelation = function(sourceRelation) { return this._attribute.setSourceRelation(sourceRelation) }
  p.sourceRelation = function() { return this._attribute.sourceRelation() }
  p.nestedRelation = function() { return this._attribute.nestedRelation() }

  p.isSame = 
    p.isEquivalent = function(other) {
      return _.quacksLike(other, knit.signature.attribute) &&
             this._attribute.isSame(other)
    }

  p.inspect = function(){return this._attribute.inspect()}

  return C
})()

knit.UnresolvedNestedAttributeReference = (function(){
  
  var _ = knit._util,
      C = function(attributeName, nestedAttributes) {
            this._attributeName = attributeName
            this._nestedAttributes = nestedAttributes
            this._sourceRelation = knit.NullRelation
          },
      p = C.prototype

  p.resolve = function(bindings) { 
    _.each(this._nestedAttributes, function(nestedAttribute){nestedAttribute.resolve(bindings)})
    return this.sourceRelation().newNestedAttribute(this._attributeName, this._nestedAttributes)
  }

  p.name = function() { return this._attributeName }
  p.structuredName = function() { return this._attributeName }
  p.fullyQualifiedName = function() { return this._attributeName }
  p.type = function() { return knit.attributeType.Nested }
  p.sourceRelation = function() { return this._sourceRelation }
  p.setSourceRelation = function(sourceRelation) { this._sourceRelation = sourceRelation; return this }
  p.nestedRelation = function() { throw("nestedRelation is not available until after resolve") }

  p.isSame = 
    p.isEquivalent = function(other) {
      return _.quacksLike(other, knit.signature.attribute) &&
             this.sourceRelation().isSame(other.sourceRelation()) &&
             this.name() == other.name()
    }

  p.inspect = function(){return "*" + this._attributeName}

  return C
})()


knit.ReferenceEnvironment = (function(){
  
  var _ = knit._util,
      C = function() {
            this._keyToRef = {}
            this._internalBindings = {}
          },
      p = C.prototype

  p.relation = function(relationName) {
    var relationRef = this._keyToRef[relationName] = this._keyToRef[relationName] || new knit.RelationReference(relationName)
    return relationRef
  }

  function regularAttr(relationNameDotAttributeName) {
    var key = relationNameDotAttributeName,
        parts = relationNameDotAttributeName.split("."),
        relationRef = this.relation(parts[0]),
        attributeName = parts[1],
        attributeRef = this._keyToRef[key] = this._keyToRef[key] || new knit.AttributeReference(relationRef, attributeName)
    return attributeRef
  }

  function nestedAttr(attributeName, nestedAttributeRefs) {
    var key = attributeName,
        attributeRef = this._keyToRef[key] = this._keyToRef[key] || new knit.NestedAttributeReference(attributeName, nestedAttributeRefs)
    return attributeRef
  }

  p.attr = function() {
    var args = _.toArray(arguments)
  
    if (args.length == 1) {
      var relationNameDotAttributeName = args[0]
      return knit._util.bind(regularAttr, this)(relationNameDotAttributeName)
    } else if (args.length==2 && _.isArray(args[1]) ){
      var attributeName = args[0],
          nestedAttributeRefs = args[1]
      return knit._util.bind(nestedAttr, this)(attributeName, nestedAttributeRefs)
    } else {
      var self = this
      return _.map(args, function(relationNameDotAttributeName){return self.attr(relationNameDotAttributeName)})
    }
  }

  p.resolve = function(externalBindings) {
    var self = this
    
    function resolveRelation(resolved, relationKey) {
      _.each(_.keys(externalBindings), function(relationKey){

        self.relation(relationKey).resolve(externalBindings)
        resolved.push(relationKey)

        _.each(externalBindings[relationKey].attributes(), function(attribute){
          resolveAttribute(resolved, relationKey, attribute)
        })
      })        
    }
    
    function resolveAttribute(resolved, relationKey, attribute) {
      var attributeKey = relationKey + "." + attribute.name()
      self.attr(attributeKey).resolve(externalBindings)
      resolved.push(attributeKey)        
    }
    
    
    var resolved = []
    _.each(_.keys(externalBindings), function(relationKey){ resolveRelation(resolved, relationKey) })
  
    var stillToResolve = _.differ(_.keys(this._keyToRef), resolved),
        allBindings = _.extend(externalBindings, this._internalBindings)
    _.each(stillToResolve, function(key){ self._keyToRef[key].resolve(allBindings) })
  
    return this
  }
  
  p.decorate = function(target, bindings) {
    target.relation = knit._util.bind(this.relation, this)
    target.attr = knit._util.bind(this.attr, this)
    
    var self = this,
        originalRename = target.rename
    target.rename = function(thing, alias) {
      var renameResult = originalRename(thing, alias)
      self._internalBindings[alias] = renameResult
      return renameResult
    }
    
    var resolveF = knit._util.bind(this.resolve, this)
    target.resolve = function(){resolveF(bindings())}
    return target
  }

  return C
})()


//knit/core/relation_defaults ======================================================
knit.mixin.relationDefaults = function(target) {

  target.compile = function(compiler){
    compiler = compiler || this.defaultCompiler()
    return compiler(this)
  }
  
  target.split = 
    target.merge = function(){return this}
  
  target.toAlgorithm = function() {
    var self = this
    return function(){return self}
  }

}


//knit/core/dsl_function ======================================================
//see http://alexyoung.org/2009/10/22/javascript-dsl/
knit._DSLFunction = function() {
  var _ = knit._util,
      dslLocals = {},
      outerFunction = function(userFunction, what_theKeywordThis_IsSupposedToBe){
        if (what_theKeywordThis_IsSupposedToBe === undefined) {
          what_theKeywordThis_IsSupposedToBe = this
        }
    
        var localNames = []
        var localValues = []
        _.each(_.keys(dslLocals), function(key){
          localNames.push(key)
          localValues.push(dslLocals[key])
        })
    
        var userFunctionBody = "(knit._util.bind(" + userFunction.toString().replace(/\s+$/, "") + ",this))()"
        var wrappingFunctionBody = "(function(" + localNames.join(",") + "){return " + userFunctionBody + "})"
        return eval(wrappingFunctionBody).apply(what_theKeywordThis_IsSupposedToBe, localValues)
      }
  
  return _.extend(outerFunction, {

    dslLocals:dslLocals,

    specialize: function(childDslLocals) {
      var allDslLocals = _.extend({}, outerFunction.dslLocals, childDslLocals)
      var childDslFunction = new knit._DSLFunction()
      _.extend(childDslFunction.dslLocals, allDslLocals)
      return childDslFunction
    }

  }) 
}


//knit/core/builder_function ======================================================

knit.createBuilderFunction = function(setup) {
  var _ = knit._util

  function convenienceMemoryRelationConversion(rawBindings) {
    var bindings = {}
    _.each(_.keys(rawBindings), function(name){
      var rawRelation = rawBindings[name],
          stringAttributes = _.map(rawRelation.attributes, function(attribute){return [attribute, knit.attributeType.String]}),
          inMemoryBaseRelation = new knit.engine.memory.MutableBaseRelation(name, stringAttributes)

      inMemoryBaseRelation.merge(rawRelation.rows)
      bindings[name] = inMemoryBaseRelation      
    })
    return bindings
  }
  
  var bindings = null
  if (setup.bindings) {
    if (typeof setup.bindings == "function") {
      bindings = setup.bindings
    } else {
      bindings = function(){return setup.bindings}
    }
  } else {
    bindings = function(){return convenienceMemoryRelationConversion(setup)}
  }
  
  var referenceResolvingWrapper = function() {
    var dslFunction = new knit._DSLFunction()
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

;(function() {
  //switcheroo
  
  var oldKnit = global.knit
  global.knit = oldKnit._util.extend(knit.createBuilderFunction, oldKnit)
})()


//knit/core/attribute_types ======================================================
knit.attributeType = {
  Integer: "INTEGER",
  String: "STRING",
  Nested: "NESTED"
}



//knit/core/attributes ======================================================
knit.Attributes = (function() {

  var _ = knit._util,
      C = function(attributeArray) {
            this._attributeArray = attributeArray
          },
      p = C.prototype,
      localCF = CollectionFunctions({
        iterator:function(attributes) { return _.iterator(attributes._attributeArray)}, 
        nothing:function(){return null}, 
        equals:function(a,b){return a && b && a.isSame && b.isSame && a.isSame(b)},
        newCollection:function(){return new C([])},
        append:function(attributes, attribute){attributes._attributeArray.push(attribute)}
      }),
      _O = localCF.functions,
      objectStyleCF = localCF.makeObjectStyleFunctions(function(){return this})

  _.each(["clone", "concat", "inspect", "without", "map",
           "each", "indexOf", "size", "differ", "empty", "indexOf", "indexesOf"], function(functionName) {
    p[functionName] = objectStyleCF[functionName]
  })
  
  p.isSame = 
    p.isEquivalent = objectStyleCF.equals
  p.splice = objectStyleCF.splice
  
  p.names = function(){return _O.pluck(this, 'name')}
  p.structuredNames = function(){return _O.pluck(this, 'structuredName')}
  p.fullyQualifiedNames = function(){return _O.pluck(this, 'fullyQualifiedName')}
  p.types = function(){return _O.pluck(this, 'type')}
  p.namesAndTypes = function(){return _O.map(this, function(attr){return [attr.name(),attr.type()]})}
  p.get = function() { 
    if (arguments.length==1) {
      var name = arguments[0]
      return _O.detect(this, function(attr){return attr.name() == name}) 
    } else {
      var args = _.toArray(arguments)
      return _O.select(this, function(attr){return _.include(args, attr.name())}) 
    }
  }
  p.fromPrimitives = function(attrNamePrimitives) {
    var flattenedAttrNamePrimitives = 
      _.map(attrNamePrimitives, function(attrNamePrimitive){
        return typeof attrNamePrimitive == "string" ? attrNamePrimitive : _.keys(attrNamePrimitive)[0]
      })
    var self = this
    return new knit.Attributes(_.map(flattenedAttrNamePrimitives, function(attrNamePrimitive){
      return _O.detect(self, function(attr){return attr.name() == attrNamePrimitive}) ||
             _O.detect(self, function(attr){return attr.fullyQualifiedName() == attrNamePrimitive})
    }))
  }
  
  p.spliceInNestedAttribute = function(nestedAttribute) {
    var firstNestedAttributePosition = _O.indexesOf(this, nestedAttribute.nestedRelation().attributes()).sort()[0]
    var withoutAttributesToNest = _O.differ(this, nestedAttribute.nestedRelation().attributes())
    return _O.splice(withoutAttributesToNest, new C([nestedAttribute]), firstNestedAttributePosition)
  }
  
  p.wrapWithOrderBy = function(relation, direction) {
    var result = relation
    _O.each(this, function(orderByAttr){
      result = new knit.algebra.Order(relation, orderByAttr, knit.algebra.Order.ASC)
    })
    return result
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
  
  return C
})()





//knit/algebra ======================================================



//knit/algebra/predicate/equality ======================================================

knit.algebra.predicate.Equality = (function(){
  
  var _ = knit._util,
      C = function(leftAtom, rightAtom) {
            this.leftAtom = leftAtom
            this.rightAtom = rightAtom
          },
      p = C.prototype

  function isAttribute(thing) { return _.quacksLike(thing, knit.signature.attribute) }
  p.leftIsAttribute = function(thing) { return isAttribute(this.leftAtom) }
  p.rightIsAttribute = function(thing) { return isAttribute(this.rightAtom) }
  
  p._attributesReferredTo = function() {
    var attributes = []
    if (this.leftIsAttribute()) { attributes.push(this.leftAtom) } 
    if (this.rightIsAttribute()) { attributes.push(this.rightAtom) } 
    return new knit.Attributes(attributes)
  }
  
  p._attributesFromRelations = function(relations) {
    var allAttributes = new knit.Attributes([])
    _.each(relations, function(r){allAttributes = allAttributes.concat(r.attributes())})
    return allAttributes
  }

  p.concernedWithNoOtherRelationsBesides = function() {    
    var expectedExclusiveRelations = _.toArray(arguments)
    var allAttributes = new knit.Attributes([])
    _.each(expectedExclusiveRelations, function(r){allAttributes = allAttributes.concat(r.attributes())})
    
    return this._attributesReferredTo().differ(allAttributes).empty()
  }
    
  p.concernedWithAllOf = function() {
    var expectedRelations = _.toArray(arguments)
    var myAttributes = this._attributesReferredTo()
    
    this._attributesReferredTo().each(function(attr){
      var relationToCheckOff = _.detect(expectedRelations, function(r){return attr.sourceRelation().isSame(r)})
      if (relationToCheckOff) expectedRelations = _.without(expectedRelations, relationToCheckOff)
    })

    return _.empty(expectedRelations)
  }
    

  function areTheseTwoThingsTheSame(a, b) {
    return a.isSame && b.isSame && a.isSame(b) || a == b
  }
  
  p.isSame = function(other) {  
    return other.constructor == C && 
           areTheseTwoThingsTheSame(this.leftAtom, other.leftAtom) &&
           areTheseTwoThingsTheSame(this.rightAtom, other.rightAtom)
  }
  
  p.isEquivalent = function(other) {
    return this.isSame(other) ||
             other.constructor == C && 
             areTheseTwoThingsTheSame(this.leftAtom, other.rightAtom) &&
             areTheseTwoThingsTheSame(this.rightAtom, other.leftAtom)
  }


  function inspectAtom(value) {
    if (value.inspect) {
      return value.inspect()
    } else if (typeof value == "string") {
      return "'" + value + "'"
    } else {
      return "" + value
    }
  }
  
  p.inspect = function() {     
    return "eq(" + inspectAtom(this.leftAtom) + "," + inspectAtom(this.rightAtom) + ")" 
  }

  return C
})()

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

knit.algebra.predicate.Conjunction = (function(){
  
  var _ = knit._util,
      C = function(leftPredicate, rightPredicate) {
            this.leftPredicate = leftPredicate
            this.rightPredicate = rightPredicate
          },
      p = C.prototype

  p.concernedWithNoOtherRelationsBesides = function() {
    var expectedExclusiveRelations = _.toArray(arguments)
    return this.leftPredicate.concernedWithNoOtherRelationsBesides.apply(this.leftPredicate, expectedExclusiveRelations) &&
           this.rightPredicate.concernedWithNoOtherRelationsBesides.apply(this.rightPredicate, expectedExclusiveRelations)
  }
  
  p.concernedWithAllOf = function() {
    var expectedRelations = _.toArray(arguments),
        self = this,
        remainingRelations = _.select(expectedRelations, function(relation){
          return ! (self.leftPredicate.concernedWithAllOf(relation) || self.rightPredicate.concernedWithAllOf(relation))
        })

    return _.empty(remainingRelations)
  }
      
  p.isSame = function(other) {
    return other.constructor == C && 
           this.leftPredicate.isSame(other.leftPredicate) &&
           this.rightPredicate.isSame(other.rightPredicate)
  }
  
  p.isEquivalent = function(other) {
    return this.isSame(other) ||
             other.constructor == C && 
             this.leftPredicate.isEquivalent(other.rightPredicate) &&
             this.rightPredicate.isEquivalent(other.leftPredicate)
  }
  
  p.inspect = function() { return "and(" + this.leftPredicate.inspect() + "," + 
                                           this.rightPredicate.inspect() + ")" }
  
  return C
})()

knit.createBuilderFunction.dslLocals.conjunction = function(leftPredicate, rightPredicate) {
  return new knit.algebra.predicate.Conjunction(leftPredicate, rightPredicate)
}

knit.createBuilderFunction.dslLocals.and = knit.createBuilderFunction.dslLocals.conjunction


//knit/algebra/predicate ======================================================



//knit/algebra/join ======================================================

knit.algebra.Join = (function(){

  var C = function(relationOne, relationTwo, predicate) {
            this.relationOne = relationOne
            this.relationTwo = relationTwo
            this.predicate = predicate || new knit.algebra.predicate.True()
          },
      p = C.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.operationName = function(){return "join"}
  
  p.newNestedAttribute = function() {    
    return this.relationOne.newNestedAttribute.apply(this.relationOne, arguments)
  }
  
  p.defaultCompiler = function(){ return this.relationOne.defaultCompiler() }

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
    return other.constructor == C && 
           this.relationOne.isSame(other.relationOne) &&
           this.relationTwo.isSame(other.relationTwo) &&
           this.predicate.isSame(other.predicate)
  }
 
  p.isEquivalent = function(other) {
    return this.isSame(other) ||
             other.constructor == C && 

             ((this.relationOne.isSame(other.relationOne) &&
              this.relationTwo.isSame(other.relationTwo)) ||

             (this.relationOne.isSame(other.relationTwo) &&
              this.relationTwo.isSame(other.relationOne))) &&

             this.predicate.isEquivalent(other.predicate)
  }
  
  p.inspect = function(){
    var inspectStr = this.operationName() + "(" + this.relationOne.inspect() + "," + this.relationTwo.inspect()
  
    if (!this._predicateIsDefault()) {
      inspectStr += "," + this.predicate.inspect()
    }
  
    inspectStr += ")"
    return inspectStr
  }

  return C
})()

knit.createBuilderFunction.dslLocals.join = function(relationOne, relationTwo, predicate) { 
  return new knit.algebra.Join(relationOne, relationTwo, predicate) 
}

knit.algebra.LeftOuterJoin = (function(){

  var _ = knit._util,
      C = function(relationOne, relationTwo, predicate) {
            this.relationOne = relationOne
            this.relationTwo = relationTwo
            this.predicate = predicate || new knit.algebra.predicate.True()
          },
      p = C.prototype
  
  _.extend(p, knit.algebra.Join.prototype)
  
  p.operationName = function(){return "leftOuterJoin"}
  
  return C
})()

knit.createBuilderFunction.dslLocals.leftOuterJoin = function(relationOne, relationTwo, predicate) { 
  return new knit.algebra.LeftOuterJoin(relationOne, relationTwo, predicate) 
}



knit.algebra.RightOuterJoin = (function(){

  var _ = knit._util,
      C = function(relationOne, relationTwo, predicate) {
            this.relationOne = relationOne
            this.relationTwo = relationTwo
            this.predicate = predicate || new knit.algebra.predicate.True()
          },
      p = C.prototype
  
  _.extend(p, knit.algebra.Join.prototype)
  
  p.operationName = function(){return "rightOuterJoin"}
  
  return C
})()

knit.createBuilderFunction.dslLocals.rightOuterJoin = function(relationOne, relationTwo, predicate) { 
  return new knit.algebra.RightOuterJoin(relationOne, relationTwo, predicate) 
}



knit.algebra.NaturalJoin = (function(){

  var _ = knit._util,
      C = function(relationOne, relationTwo, suffix) {
            this.relationOne = relationOne
            this.relationTwo = relationTwo
            this.suffix = suffix || "Id"
          },
      p = C.prototype
  
  _.extend(p, knit.algebra.Join.prototype)
  
  p.operationName = function(){return "naturalJoin"}
  
  return C
})()

knit.createBuilderFunction.dslLocals.naturalJoin = function(relationOne, relationTwo, suffix) { 
  return new knit.algebra.NaturalJoin(relationOne, relationTwo, suffix) 
}



//knit/algebra/divide ======================================================

knit.algebra.Divide = (function(){

  var C = function(dividend, divisor) {
            this.dividend = dividend
            this.divisor = divisor
            //predicate?
          },
      p = C.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.newNestedAttribute = function() {    
    return this.dividend.newNestedAttribute.apply(this.dividend, arguments)
  }
  
  p.attributes = function(){ return this.dividend.attributes().differ(this.divisor.attributes()) }
  
  p.defaultCompiler = function() { return this.dividend.defaultCompiler() }

  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == C && 
             this.dividend.isSame(other.dividend) &&
             this.dividend.isSame(other.divisor)
    }
   // 
   // p.isEquivalent = function(other) {
   //   return this.isSame(other) ||
   //            other.constructor == C && 
   // 
   //            ((this.dividendOne.isSame(other.relationOne) &&
   //             this.dividendTwo.isSame(other.relationTwo)) ||
   // 
   //            (this.dividendOne.isSame(other.relationTwo) &&
   //             this.dividendTwo.isSame(other.relationOne))) &&
   // 
   //            this.predicate.isEquivalent(other.predicate)
   // }
  
  p.inspect = function(){
    return "divide(" + this.dividend.inspect() + "," + this.divisor.inspect() + ")"
  }

  return C
})()

knit.createBuilderFunction.dslLocals.divide = function(dividend, divisor) { 
  return new knit.algebra.Divide(dividend, divisor) 
}


//knit/algebra/nest_unnest ======================================================

knit.algebra.Unnest = (function(){

  var C = function(relation, nestedAttribute) {
            this.relation = relation
            this.nestedAttribute = nestedAttribute
          },
      p = C.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.defaultCompiler = function(){ return this.relation.defaultCompiler() }

  p.attributes = function(){ 
    var nestedAttributeIndex = this.relation.attributes().indexOf(this.nestedAttribute)
    return this.relation.attributes().splice(this.nestedAttribute.nestedRelation().attributes(), nestedAttributeIndex, 1)
  }
  
  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == C && 
             this.relation.isSame(other.relation) &&
             this.nestedAttribute.isSame(other.nestedAttribute)
    }
  
  p.inspect = function(){return "unnest(" + this.relation.inspect() + "," + 
                                            this.nestedAttribute.inspect() + ")"}
  
  return C
})()

knit.createBuilderFunction.dslLocals.unnest = function(relation, nestedAttribute) { 
  return new knit.algebra.Unnest(relation, nestedAttribute) 
}

knit.algebra.Nest = (function(){

  var C = function(relation, nestedAttribute) {
            this.relation = relation
            this.nestedAttribute = nestedAttribute
            this.nestedAttribute.setSourceRelation(relation)
          },
      p = C.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.defaultCompiler = function(){ return this.relation.defaultCompiler() }
  
  p.attributes = function(){ 
    return this.relation.attributes().spliceInNestedAttribute(this.nestedAttribute)
  }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }
  
  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == C && 
             this.relation.isSame(other.relation) &&
             this.nestedAttribute.isSame(other.nestedAttribute)
    }
  
  p.inspect = function(){return "nest(" + this.relation.inspect() + "," + this.nestedAttribute.inspect() + ")"}

  return C
})()

knit.createBuilderFunction.dslLocals.nest = function(relation, nestedAttribute) {
  return new knit.algebra.Nest(relation, nestedAttribute)
}





//knit/algebra/rename ======================================================

knit.algebra.RenameRelation = (function() {

  var _ = knit._util,
      C = function(relation, alias) {
            this.relation = relation
            this.alias = alias
          },
      p = C.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.attributes = function(){ return this.relation.attributes() }
  p.attr = function() { return this.relation.attributes().get(_.toArray(arguments)) }
  
  p.newNestedAttribute = function() { return this.relation.newNestedAttribute.apply(this.relation, arguments) }

  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == C && 
             this.relation.isSame(other.relation) &&
             this.alias == other.alias
    }
  
  p.inspect = function(){return "rename(" + this.relation.inspect() + "," + this.alias + ")"}

  return C
})()

knit.algebra.RenameAttribute = (function() {

  var C = function(attribute, alias) {
            this.attribute = attribute
            this.alias = alias
          },
      p = C.prototype
  
  p.name = function(){ return this.alias }
  p.type = function(){ return this.attribute.type() }
  p.sourceRelation = function(){ return this.attribute.sourceRelation() }

  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == C && 
             this.attribute.isSame(other.attribute) &&
             this.alias == other.alias
    }
  
  p.inspect = function(){return "#" + this.alias}

  return C
})()


knit.createBuilderFunction.dslLocals.rename = function(thing, alias) {
  if (knit._util.quacksLike(thing, knit.signature.relation)) {
    return new knit.algebra.RenameRelation(thing, alias)
  } else {
    return new knit.algebra.RenameAttribute(thing, alias)
  }
}


//knit/algebra/select ======================================================

knit.algebra.Select = (function() {
  
  var _ = knit._util,
      C = function(relation, predicate) {
        this.relation = relation
        this.predicate = predicate
      }, 
      p = C.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.defaultCompiler = function() { return this.relation.defaultCompiler() }

  p.attributes = function(){ return this.relation.attributes() }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }
  
  p.merge = function() {
    if (this.relation.predicate) {
      return new C(this.relation.relation.merge(), new knit.algebra.predicate.Conjunction(this.relation.predicate, this.predicate))
    } else {
      return this
    }
  }
  
  p.split = function() {
    if (this.predicate.constructor == knit.algebra.predicate.Conjunction) {
        return new C(
          new C(this.relation.split(), this.predicate.leftPredicate),
          this.predicate.rightPredicate
        )
    } else {
      return this
    }
  }
  
  p._doPush = function(relation) { return new C(relation, this.predicate).push() }
  
  p.push = function() {
    if (_.quacksLike(this.relation, knit.signature.join)) {
      var join = this.relation
      if (this.predicate.concernedWithNoOtherRelationsBesides(join.relationOne)) {
        join.relationOne = this._doPush(join.relationOne)
        return join
      } else if (this.predicate.concernedWithNoOtherRelationsBesides(join.relationTwo)) {
        join.relationTwo = this._doPush(join.relationTwo)
        return join
      } else if (this.predicate.concernedWithNoOtherRelationsBesides(join.relationOne, join.relationTwo) &&
                 this.predicate.concernedWithAllOf(join.relationOne, join.relationTwo)) {
        join.appendToPredicate(this.predicate)
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
    return other.constructor == C && 
           this.relation.isSame(other.relation) &&
           this.predicate.isSame(other.predicate)
  }
  
  p.isEquivalent = function(other) {
    if (other.constructor == C) {
      var thisMerged = this.merge()
      var otherMerged = other.merge()
    
      return thisMerged.isSame(otherMerged) ||
               thisMerged.relation.isEquivalent(otherMerged.relation) &&
               thisMerged.predicate.isEquivalent(otherMerged.predicate)
    } else {
      return false
    }
  }
  
  p.inspect = function(){return "select(" + this.relation.inspect() + "," + 
                                            this.predicate.inspect() + ")"}
  
  return C
})()

knit.createBuilderFunction.dslLocals.select = function(relation, predicate) {
  return new knit.algebra.Select(relation, predicate)
}



//knit/algebra/project ======================================================

//proh JEKT
knit.algebra.Project = (function() {

  var C = function(relation, attributes) {
            this._attributes = attributes
            this.relation = relation
          },
      p = C.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.defaultCompiler = function() { return this.relation.defaultCompiler() }
  p.attributes = function(){ return this._attributes }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }

  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == C && 
             this.relation.isSame(other.relation) &&
             this.attributes().isSame(other.attributes())
    }
  
  p.inspect = function(){return "project(" + this.relation.inspect() + "," + 
                                        "[" + this.attributes().inspect() + "])"}

  return C
})()

knit.createBuilderFunction.dslLocals.project = function(relation, attributes) {
  return new knit.algebra.Project(relation, new knit.Attributes(attributes))
}


//knit/algebra/order ======================================================

knit.algebra.Order = (function(){
  
  var C = function(relation, orderAttribute, direction) {
            this.relation = relation
            this.orderAttribute = orderAttribute
            this.direction = direction
          },
      p = C.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.defaultCompiler = function(){ return this.relation.defaultCompiler() }

  p.attributes = function(){ return this.relation.attributes() }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }
  
  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == C && 
             this.relation.isSame(other.relation) &&
             this.orderAttribute.isSame(other.orderAttribute) &&
             this.direction == other.direction
    }
  
  p.inspect = function(){return "order." + this.direction + 
                                  "(" + this.relation.inspect() + "," + 
                                        this.orderAttribute.inspect() + ")"}
  
  C.ASC = "asc"
  C.DESC = "desc"
  
  return C
})()

knit.createBuilderFunction.dslLocals.order = {
  asc: function(relation, orderAttribute) { return new knit.algebra.Order(relation, orderAttribute, knit.algebra.Order.ASC) },
  desc: function(relation, orderAttribute) { return new knit.algebra.Order(relation, orderAttribute, knit.algebra.Order.DESC) }
}




