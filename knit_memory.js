

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






//knit/engine/memory/attribute ======================================================
knit.engine.memory.Attribute = (function(){

  var _ = knit._util,
      C = function(name, type, sourceRelation) {
            this._name = name
            this._sourceRelation = sourceRelation
          },
      p = C.prototype

  p.name = 
    p.structuredName = function() { return this._name }
  p.fullyQualifiedName = function() { return this.sourceRelation().name() + "." + this.name() }
  p.type = function() { }
  p.sourceRelation = function() { return this._sourceRelation }
  p.isSame = 
    p.isEquivalent = function(other) {
      return _.quacksLike(other, knit.signature.attribute) &&
             this.name() == other.name() &&
             this.sourceRelation().id() == other.sourceRelation().id()
    }
  
  p.inspect = function() { return this.name() }
  
  return C
})()

knit.engine.memory.NestedAttribute = (function(){

  var _ = knit._util,
      C = function(name, nestedRelation, sourceRelation) {
            this._name = name
            this._nestedRelation = nestedRelation
            this._sourceRelation = sourceRelation
          },
      p = C.prototype
  
  p.name = function() { return this._name }
  p.structuredName = function() { 
    var result = {}
    result[this.name()] = this.nestedRelation().attributes().structuredNames()
    return result
  }
  p.fullyQualifiedName = function() { 
    var result = {}
    result[this.name()] = this.nestedRelation().attributes().fullyQualifiedNames()
    return result
  }
  p.type = function() { return knit.attributeType.Nested }
  p.sourceRelation = function() { return this._sourceRelation }
  p.nestedRelation = function() { return this._nestedRelation }
  p.isSame = 
    p.isEquivalent = function(other) {
      return _.quacksLike(other, knit.signature.nestedAttribute) &&
             this.name() == other.name() &&
             this.nestedRelation().id() == other.nestedRelation().id()
    }
  
  p.inspect = function() {
    return this.name() + ":" + this.nestedRelation().inspect()
  }
  
  return C
})()



//knit/executable_relation ======================================================
//quacksLike relation
knit.ExecutableRelation = (function() {

  var _ = knit._util,
      C = function(executionStrategy) {
            this._executionStrategy = executionStrategy
          },
      p = C.prototype
  
  _.each(["name"], function(methodNameToDelegate) {
    p[methodNameToDelegate] = function() { 
      return this._executionStrategy[methodNameToDelegate].apply(this._executionStrategy, arguments) 
    }
  })
  
  _.delegate(p, knit.signature.relation, function(){return this._executionStrategy})

  function rowToObject(row, attributeNames) {
    var object = {}
    _.each(attributeNames, function(attributeName, i){
      var nested = typeof attributeName == "object"
      if (nested) {
        var nestedRows = row[i]
        var thisAttributeName = _.keys(attributeName)[0]
        var nestedAttributeNames = _.values(attributeName)[0]
        object[thisAttributeName] = rowsToObjects(nestedRows, nestedAttributeNames)
      } else {
        object[attributeName] = row[i]
      }
    })
    return object
  }

  function rowsToObjects(rows, attributeNames) {
    return _.map(rows, function(row){ return rowToObject(row, attributeNames) })
  }
  
  p.objects = function(objectCallback) {
    var attributeNames = this.attributes().structuredNames()
    var rowConverter = function(row){ return rowToObject(row, attributeNames) }
    if (objectCallback) {
      this.rows(function(row){
        if (row === null) {
          objectCallback(null)
        } else {
          objectCallback(rowToObject(row, attributeNames))
        }
      })
    } else {
      return rowsToObjects(this.rows(), attributeNames)
    }
  }
    
  p.rows = function(rowCallback) {
    if (rowCallback) {
      this._executionStrategy.rowsAsync(rowCallback)
    } else {
      return this._executionStrategy.rowsSync()
    }
  }
  
  p.cost = function() { return this._executionStrategy.cost() }
  
  return C
})()


//knit/algorithms ======================================================

knit.algorithms = (function(){
  var _util = knit._util
  var _ = CollectionFunctions.Array.withStatTracking.functions
  
  function costTrackingWrapper(innerF) {
    return function() {
      var args = _.toArray(arguments)
      _.resetTotalCost()
      var result = innerF.apply(null, args)
      result.cost = _.totalCost()
      return result
    }
  }
  
  function algorithmFunction(attributesFunction, rowsFunction) {
    var main = function() {
      var args = _.toArray(arguments)
      return costTrackingWrapper(function(){
        return {attributes:attributesFunction.apply(null, args), rows:rowsFunction.apply(null, args)}
      })()
    }
    main.attributes = attributesFunction
    main.rows = rowsFunction
    return main
  }
  
  function sameAttributes(relation) {
    return relation.attributes
  }
  
  function selectRows(relation, predicate) {
    return _.select(relation.rows, function(row){
             return predicate(row)
           })        
  }
  var select = algorithmFunction(sameAttributes, selectRows)

  
  function projectAttributes(relation, keepAttributes) {
    return keepAttributes
  }
  
  function projectRows(relation, keepAttributes) {
    var positionsToKeep = _.indexesOf(relation.attributes, keepAttributes)
    return _.map(relation.rows, function(row) {
            return _.map(positionsToKeep, function(position) {
              return row[position]
            })
          })
  }
  var project = algorithmFunction(projectAttributes, projectRows)


  function orderAscRows(relation, orderAttribute) {
    var columnNumber = _.indexOf(relation.attributes, orderAttribute)
    return _.sortBy(relation.rows, function(row){ return row[columnNumber] })
  }
  var orderAsc = algorithmFunction(sameAttributes, orderAscRows)

  function orderDescRows(relation, orderAttribute) {
    return orderAscRows(relation, orderAttribute).reverse()
  }
  var orderDesc = algorithmFunction(sameAttributes, orderDescRows)


  function joinRows(combinedAttributes, outerRows, innerRows, predicate, candidateJoinRowFunction, 
                    innerAttributes, noInnerMatchFoundFunction) {
    var resultRows = []
    
    _.each(outerRows, function(outerRow){
      var innerRowMatchFound = false
      _.each(innerRows, function(innerRow){
        var candidateJoinRow = candidateJoinRowFunction(outerRow, innerRow) 
        if (predicate(candidateJoinRow)) {
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
  
  function combineAttributes(relationOne, relationTwo) {
    return relationOne.attributes.concat(relationTwo.attributes)           
  }
  
  var TRUE_PREDICATE = function(){return true}
  
  function standardJoinRows(relationOne, relationTwo, predicate) {
    predicate = predicate || TRUE_PREDICATE
    
    return joinRows(
              combineAttributes(relationOne, relationTwo),
              relationOne.rows,
              relationTwo.rows,
              predicate,
              function(leftRow, rightRow){return [].concat(leftRow).concat(rightRow)}
            )
  }
  var join = algorithmFunction(combineAttributes, standardJoinRows)
  
  function leftOuterJoinRows(relationOne, relationTwo, predicate) {
    predicate = predicate || TRUE_PREDICATE
    
    return joinRows(
             combineAttributes(relationOne, relationTwo),
             relationOne.rows,
             relationTwo.rows,
             predicate,
             function(leftRow, rightRow){return [].concat(leftRow).concat(rightRow)},
             relationTwo.attributes,
             function(rightAttributes, leftRow, joinRows){
               var rightAsNulls = _.repeat([null], rightAttributes.length),
                   leftRowWithNullRightValues = [].concat(leftRow).concat(rightAsNulls)
               joinRows.push(leftRowWithNullRightValues)
             }
           )
  }
  var leftOuterJoin = algorithmFunction(combineAttributes, leftOuterJoinRows)
  
  function rightOuterJoinRows(relationOne, relationTwo, predicate) {
    predicate = predicate || TRUE_PREDICATE
    
    return joinRows(
             combineAttributes(relationOne, relationTwo),
             relationTwo.rows,
             relationOne.rows,
             predicate,
             function(rightRow, leftRow){return [].concat(leftRow).concat(rightRow)},
             relationOne.attributes,
             function(leftAttributes, rightRow, joinRows){
               var leftAsNulls = _.repeat([null], leftAttributes.length),
                   rightRowWithNullLeftValues = [].concat(leftAsNulls).concat(rightRow)
               joinRows.push(rightRowWithNullLeftValues)
             }
           )
  }
  var rightOuterJoin = algorithmFunction(combineAttributes, rightOuterJoinRows)
  
  
  function baseAttribute(attribute) { return attribute.indexOf(".")>=0 ? attribute.split(".")[1] : attribute }
  
  function makeAttributesIntoPredicate(attributes, relationOne, relationTwo) {  
    var relationOneBaseAttributes = _.map(relationOne.attributes, baseAttribute),
        relationTwoBaseAttributes = _.map(relationTwo.attributes, baseAttribute)

    if (attributes.length == 1) {
      var attribute = attributes.shift(),
          positionInRelationOne = _.indexOf(relationOneBaseAttributes, attribute),
          positionInRelationTwo = _.indexOf(relationTwoBaseAttributes, attribute)
      return function(row){return row[positionInRelationOne] == row[relationOne.attributes.length + positionInRelationTwo]}
    } else if (attributes.length > 1) {
      var attributeOne = attributes.shift(),
          leftPredicate = makeAttributesIntoPredicate([attributeOne], relationOne, relationTwo),
          rightPredicate = makeAttributesIntoPredicate(attributes, relationOne, relationTwo)
      return function(row) {return leftPredicate(row) && rightPredicate(row)}
    } else {
      return TRUE_PREDICATE
    }
  }

  function commonAttributesHavingSuffix(relationOne, relationTwo, suffix) {
    suffix = suffix || ".*"
    var relationOneBaseAttributes = _.map(relationOne.attributes, baseAttribute),
        relationTwoBaseAttributes = _.map(relationTwo.attributes, baseAttribute),
        commonAttributes = _.intersect(relationOneBaseAttributes, relationTwoBaseAttributes),
        regexp = new RegExp(suffix + "$")
    return _.select(commonAttributes, function(attribute){return attribute.match(regexp)})
  }
    
  function naturalJoinRows(relationOne, relationTwo, suffix) {
    var predicate = 
      makeAttributesIntoPredicate(
        _.uniq(commonAttributesHavingSuffix(relationOne, relationTwo, suffix)),
        relationOne, 
        relationTwo
      )
    return standardJoinRows(relationOne, relationTwo, predicate)
  }
  var naturalJoin = algorithmFunction(combineAttributes, naturalJoinRows)
  
  
  
  var _N = CollectionFunctions.Array.
              appendFeatures({
                equals:function(a,b){
                  return _util.deepEqual(a, b)
                }
              }).functions

  
  function attributesForNest(relation, nestedAttribute, newAttributeArrangement) {
    return newAttributeArrangement
  }
  
  function nestRows(relation, nestedAttribute, newAttributeArrangement) {
    //assumption: this relation is ordered by all non-nested attributes.  
    //note that for now this is guaranteed by nest.
        
    function mapFlatPositions() {
      var newFlatAttrPositionToOldFlatAttrPosition = {}
      _.each(newAttributeArrangement, function(newAttr, newPosition){
        if (!_util.deepEqual(newAttr, nestedAttribute)) {
          var oldFlatPosition = _N.indexOf(relation.attributes, newAttr)
          newFlatAttrPositionToOldFlatAttrPosition[newPosition] = oldFlatPosition
        }
      })
      return newFlatAttrPositionToOldFlatAttrPosition
    }
    

    var nestedRelationAttributes = _util.values(nestedAttribute)[0]
    
    var oldNestedPositions = _N.indexesOf(relation.attributes, nestedRelationAttributes),
        oldFlatPositions = _N.indexesOf(relation.attributes, _N.without(newAttributeArrangement, nestedAttribute)),
        newFlatAttrPositionToOldFlatAttrPosition = mapFlatPositions()

    var nestedAttributePosition = _N.indexOf(newAttributeArrangement, nestedAttribute)

    var newRows = [],
        currentNewRow = null,
        currentFlatValues = null
        
    _.each(relation.rows, function(row) {
      var flatValuesForThisRow = _.get(row, oldFlatPositions),
          nestedValuesForThisRow = _.get(row, oldNestedPositions),
          allValuesAreNull = !(_.detect(nestedValuesForThisRow, function(value){return value !== null}))
      
      if (currentFlatValues!==null && _.equals(flatValuesForThisRow, currentFlatValues)) {
        if ( ! allValuesAreNull) currentNewRow[nestedAttributePosition].push(nestedValuesForThisRow)
      } else {
        if (currentNewRow) newRows.push(currentNewRow)
        
        currentNewRow = _.map(newAttributeArrangement, function(attr, newPos){
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
    
    return newRows
  }
  var nest = algorithmFunction(attributesForNest, nestRows)
  
  function flattenNestedAttribute(relation, nestedAttribute) {
    var nestedRelationAttributes = _util.values(nestedAttribute)[0],
        nestedAttributeIndex = _N.indexOf(relation.attributes, nestedAttribute)
    return _N.splice(relation.attributes, nestedRelationAttributes, nestedAttributeIndex, 1)
  }
  
  function unnestRows(relation, nestedAttribute) {
    var nestedAttributeIndex = _N.indexOf(relation.attributes, nestedAttribute),
        newAttributes = flattenNestedAttribute(relation, nestedAttribute),
        unnestedRows = []

    _.each(relation.rows, function(row) {
      var nestedRows = row[nestedAttributeIndex]
      _.each(nestedRows, function(nestedRow){
        unnestedRows.push(_.splice(row, nestedRow, nestedAttributeIndex, 1))
      })
    })
    
    return unnestedRows
  }
  var unnest = algorithmFunction(flattenNestedAttribute, unnestRows)
  
  
  function divideRows(dividendAttributes, dividendRows, divisorAttributes, divisorRows, quotientAttributes) {
    function computeQualifyingDividendRows(dividendRows, dividendAttributes, divisorAttributes) {
      var divisorPositionsInDividend = _.indexesOf(dividendAttributes, divisorAttributes)
      //efficiency later
      return _.select(dividendRows, function(dividendRow) {
        var divisorCandidate = _.get(dividendRow, divisorPositionsInDividend)
        return _.detect(divisorRows, function(divisorRow){return _.equals(divisorRow, divisorCandidate)})
      })
    }
    
    var quotientPositionsInDividend = _.indexesOf(dividendAttributes, quotientAttributes),
        qualifyingDividendRows = computeQualifyingDividendRows(dividendRows, dividendAttributes, divisorAttributes),
        quotientRows = [],
        currentQuotientRow = null
    _.each(qualifyingDividendRows, function(dividendRow){
      var candidateQuotientRow = _.get(dividendRow, quotientPositionsInDividend)
      if (currentQuotientRow===null || !_.equals(candidateQuotientRow, currentQuotientRow)) {
        quotientRows.push(candidateQuotientRow)
        currentQuotientRow = candidateQuotientRow
      }
    })
    return quotientRows
  }
  
  function quotientAttributes(dividend, divisor) {
    return _.differ(dividend.attributes, divisor.attributes)
  }
  function quotientRows(relation, divisor) {
    return divideRows(relation.attributes, relation.rows, 
                      divisor.attributes, divisor.rows,
                      quotientAttributes(relation, divisor))
  }
  var divide = algorithmFunction(quotientAttributes, quotientRows)  
  
  
  return {select:select, 
          project:project, 
          join:join, leftOuterJoin:leftOuterJoin, rightOuterJoin:rightOuterJoin, naturalJoin:naturalJoin,
          divide: divide,
          orderAsc:orderAsc, orderDesc:orderDesc,
          nest:nest, unnest:unnest}
})()


//knit/translation/algorithm/algebra_to_algorithm ======================================================

;(function(){
  var _ = knit._util

  function newRelation(rawRelation, name, attributes, priorCost) {
    return new knit.engine.memory.BaseRelation(name, attributes, [], rawRelation.rows, priorCost + rawRelation.cost) 
  }

  function compile(relation) { return relation.defaultCompiler()(relation) }  
  function getAttributes(relation) { return compile(relation).attributes() }
  
  function toRawRelation(relation) {
    var compiled = compile(relation)
    return {name:compiled.name(), 
            attributes:compiled.attributes().fullyQualifiedNames(), 
            rows:compiled.rows(),
            cost:compiled.cost()}
  }

  function toRawAttributes(attrs) { return attrs.fullyQualifiedNames() }
  
  knit.RelationReference.prototype.toAlgorithm = function() {
    var self = this
    return function(){return self}
  }
  
  knit.algebra.Project.prototype.toAlgorithm = function() {
    var self = this
    return function() {
      var rawRelation = toRawRelation(self.relation),
          keepAttributes = self.attributes(),
          result = knit.algorithms.project(rawRelation, toRawAttributes(keepAttributes))
      return newRelation(result, rawRelation.name, keepAttributes, rawRelation.cost)
    }
  }

  knit.algebra.Select.prototype.toAlgorithm = function() {
    var self = this
    return function() {
      var rawRelation = toRawRelation(self.relation),
          attributes = self.attributes(),
          rawPredicate = function(row) { return self.predicate.match(attributes, row) },
          result = knit.algorithms.select(rawRelation, rawPredicate)
      return newRelation(result, rawRelation.name, self.attributes(), rawRelation.cost)
    }
  }
    
    
  function join(relationOne, relationTwo, predicate, joinFunction, name) {
    var rawRelationOne = toRawRelation(relationOne),
        rawRelationTwo = toRawRelation(relationTwo),
        combinedAttributes = relationOne.attributes().concat(relationTwo.attributes()),
        rawPredicate = function(row) { return predicate.match(combinedAttributes, row) },
        result = joinFunction(rawRelationOne, rawRelationTwo, rawPredicate)
    return newRelation(result, name, combinedAttributes, rawRelationOne.cost + rawRelationTwo.cost) 
  }
    
  knit.algebra.Join.prototype.toAlgorithm = function() {
    var self = this
    return function() { return join(self.relationOne, self.relationTwo, self.predicate, 
                                    knit.algorithms.join, self.name()) }
  }
  
  knit.algebra.LeftOuterJoin.prototype.toAlgorithm = function() {
    var self = this
    return function() { return join(self.relationOne, self.relationTwo, self.predicate, 
                                    knit.algorithms.leftOuterJoin, self.name()) }
  }
  
  knit.algebra.RightOuterJoin.prototype.toAlgorithm = function() {
    var self = this
    return function() { return join(self.relationOne, self.relationTwo, self.predicate, 
                                    knit.algorithms.rightOuterJoin, self.name()) }
  }
  
  knit.algebra.NaturalJoin.prototype.toAlgorithm = function() {
    var self = this
    return function() { 
      var combinedAttributes = self.relationOne.attributes().concat(self.relationTwo.attributes()),
          rawRelationOne = toRawRelation(self.relationOne),
          rawRelationTwo = toRawRelation(self.relationTwo),
          result = knit.algorithms.naturalJoin(rawRelationOne, rawRelationTwo, self.suffix)
      return newRelation(result, self.name(), combinedAttributes, rawRelationOne.cost + rawRelationTwo.cost) 
    }
  }
  
  knit.algebra.Order.prototype.toAlgorithm = function() {
    var self = this
    return function() { 
      var orderFunction = self.direction == knit.algebra.Order.DESC ? 
                            knit.algorithms.orderDesc : 
                            knit.algorithms.orderAsc,
          rawRelation = toRawRelation(self.relation),
          result = orderFunction(rawRelation, self.orderAttribute.fullyQualifiedName())
      return newRelation(result, rawRelation.name, getAttributes(self.relation), rawRelation.cost) 
    }
  }
  
  knit.algebra.Divide.prototype.toAlgorithm = function() {
    var self = this
    return function() {
      var rawDividendRelation = toRawRelation(self.dividend),
          rawDivisorRelation = toRawRelation(self.divisor),
          result = knit.algorithms.divide(rawDividendRelation, rawDivisorRelation),
          quotientAttributes = self.dividend.attributes().differ(self.divisor.attributes())
      return newRelation(result, self.name(), quotientAttributes, rawDividendRelation.cost + rawDivisorRelation.cost)
    }
  }
            
  knit.algebra.Unnest.prototype.toAlgorithm = function() {
    var self = this
    return function() {
      var rawRelation = toRawRelation(self.relation),
          result = knit.algorithms.unnest(rawRelation, self.nestedAttribute.fullyQualifiedName()),
          allAttributes = getAttributes(self.relation).concat(getAttributes(self.nestedAttribute.nestedRelation()))
      return newRelation(result, self.name(), allAttributes.fromPrimitives(result.attributes), rawRelation.cost)
    }
  }
      
  knit.algebra.Nest.prototype.toAlgorithm = function() {
    //assumption: this relation is ordered by all non-nested attributes.  
    //note that for now this is guaranteed by nest.
    var self = this
    return function() {
      var newAttributeArrangement = getAttributes(self.relation).spliceInNestedAttribute(self.nestedAttribute),
          rawRelation = toRawRelation(self.relation),
          result = knit.algorithms.nest(rawRelation, 
                                        self.nestedAttribute.fullyQualifiedName(), 
                                        newAttributeArrangement.fullyQualifiedNames())
      return newRelation(result, self.name(), newAttributeArrangement, rawRelation.cost)
    }
  }
  
      
      
  //this name business needs to be thought through

  knit.algebra.Select.prototype.name = 
    knit.algebra.Project.prototype.name = 
    knit.algebra.Nest.prototype.name = 
    knit.algebra.Unnest.prototype.name = function() {
    return this.relation.name()
  }
  
  knit.algebra.Join.prototype.name =
    knit.algebra.LeftOuterJoin.prototype.name =
    knit.algebra.RightOuterJoin.prototype.name =
    knit.algebra.NaturalJoin.prototype.name = function() {
    return this.relationOne.name() + "__" + this.relationTwo.name()
  }
  
  knit.algebra.Divide.prototype.name = function() {
    return this.dividend.name() + "$$" + this.divisor.name()
  }
  
  
})()


//knit/translation/algorithm/predicate_match ======================================================
knit.algebra.predicate.True.prototype.
  match = function(attributes, row) {
    return true
  }

knit.algebra.predicate.False.prototype.
  match = function(attributes, row) {
    return false
  }

knit.algebra.predicate.Equality.prototype.
  match = function(attributes, row) {
    function getValue(atom, attributes, row) {
      return knit._util.quacksLike(atom, knit.signature.attribute) ? row[attributes.indexOf(atom)] : atom
    }

    var left = getValue(this.leftAtom, attributes, row)
    var right = getValue(this.rightAtom, attributes, row)
    return left == right
  }

knit.algebra.predicate.Conjunction.prototype.
  match = function(attributes, row) {
    return this.leftPredicate.match(attributes, row) && 
           this.rightPredicate.match(attributes, row)
  }  



//knit/use_algorithms ======================================================
//UseAlgorithms quacksLike execution strategy
knit.UseAlgorithms = (function() {
  
  var _ = knit._util,
      C = function(algorithmFunction) {
            this._algorithmFunction = algorithmFunction
          },
      p = C.prototype
  
  p._getRelationResult = function(){
    this._relationResult = this._relationResult || this._algorithmFunction()
    return this._relationResult
  }
  
  _.each(["name"], function(methodNameToDelegate) {
    p[methodNameToDelegate] = function() { 
      return this._getRelationResult()[methodNameToDelegate].apply(this._getRelationResult(), arguments) 
    }
  })
  
  _.delegate(p, knit.signature.relation, function(){return this._getRelationResult()})
  
  p.cost = function() { return this._getRelationResult().cost() }
  p.rowsSync = function() { return this._getRelationResult().rows() }
  
  // p.rowsAsync = function(rowCallback) {
  //   var disambiguatingColumnNamesInOrder = getDisambiguatingColumnNamesInOrder(this)
  //   this._conn.query(this._sqlSelectObject.toStatement(), function(rawObject){
  //     if (rawObject==null) {
  //       rowCallback(null)
  //     } else {
  //       rowCallback(cleanRow(rawObject, disambiguatingColumnNamesInOrder))        
  //     }
  //   })
  // }
    
  
  C.expressionCompiler = function() {
    return function(expression) {
      return new knit.ExecutableRelation(new C(expression.toAlgorithm()))
    }
  }
  
  return C
})()



//vendor/jshashtable ======================================================
/**
 * Copyright 2010 Tim Down.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * jshashtable
 *
 * jshashtable is a JavaScript implementation of a hash table. It creates a single constructor function called Hashtable
 * in the global scope.
 *
 * Author: Tim Down <tim@timdown.co.uk>
 * Version: 2.1
 * Build date: 21 March 2010
 * Website: http://www.timdown.co.uk/jshashtable
 */

Hashtable = (function() {
	var FUNCTION = "function";

	var arrayRemoveAt = (typeof Array.prototype.splice == FUNCTION) ?
		function(arr, idx) {
			arr.splice(idx, 1);
		} :

		function(arr, idx) {
			var itemsAfterDeleted, i, len;
			if (idx === arr.length - 1) {
				arr.length = idx;
			} else {
				itemsAfterDeleted = arr.slice(idx + 1);
				arr.length = idx;
				for (i = 0, len = itemsAfterDeleted.length; i < len; ++i) {
					arr[idx + i] = itemsAfterDeleted[i];
				}
			}
		};

	function hashObject(obj) {
		var hashCode;
		if (typeof obj == "string") {
			return obj;
		} else if (typeof obj.hashCode == FUNCTION) {
			// Check the hashCode method really has returned a string
			hashCode = obj.hashCode();
			return (typeof hashCode == "string") ? hashCode : hashObject(hashCode);
		} else if (typeof obj.toString == FUNCTION) {
			return obj.toString();
		} else {
			try {
				return String(obj);
			} catch (ex) {
				// For host objects (such as ActiveObjects in IE) that have no toString() method and throw an error when
				// passed to String()
				return Object.prototype.toString.call(obj);
			}
		}
	}

	function equals_fixedValueHasEquals(fixedValue, variableValue) {
		return fixedValue.equals(variableValue);
	}

	function equals_fixedValueNoEquals(fixedValue, variableValue) {
		return (typeof variableValue.equals == FUNCTION) ?
			   variableValue.equals(fixedValue) : (fixedValue === variableValue);
	}

	function createKeyValCheck(kvStr) {
		return function(kv) {
			if (kv === null) {
				throw new Error("null is not a valid " + kvStr);
			} else if (typeof kv == "undefined") {
				throw new Error(kvStr + " must not be undefined");
			}
		};
	}

	var checkKey = createKeyValCheck("key"), checkValue = createKeyValCheck("value");

	/*----------------------------------------------------------------------------------------------------------------*/

	function Bucket(hash, firstKey, firstValue, equalityFunction) {
        this[0] = hash;
		this.entries = [];
		this.addEntry(firstKey, firstValue);

		if (equalityFunction !== null) {
			this.getEqualityFunction = function() {
				return equalityFunction;
			};
		}
	}

	var EXISTENCE = 0, ENTRY = 1, ENTRY_INDEX_AND_VALUE = 2;

	function createBucketSearcher(mode) {
		return function(key) {
			var i = this.entries.length, entry, equals = this.getEqualityFunction(key);
			while (i--) {
				entry = this.entries[i];
				if ( equals(key, entry[0]) ) {
					switch (mode) {
						case EXISTENCE:
							return true;
						case ENTRY:
							return entry;
						case ENTRY_INDEX_AND_VALUE:
							return [ i, entry[1] ];
					}
				}
			}
			return false;
		};
	}

	function createBucketLister(entryProperty) {
		return function(aggregatedArr) {
			var startIndex = aggregatedArr.length;
			for (var i = 0, len = this.entries.length; i < len; ++i) {
				aggregatedArr[startIndex + i] = this.entries[i][entryProperty];
			}
		};
	}

	Bucket.prototype = {
		getEqualityFunction: function(searchValue) {
			return (typeof searchValue.equals == FUNCTION) ? equals_fixedValueHasEquals : equals_fixedValueNoEquals;
		},

		getEntryForKey: createBucketSearcher(ENTRY),

		getEntryAndIndexForKey: createBucketSearcher(ENTRY_INDEX_AND_VALUE),

		removeEntryForKey: function(key) {
			var result = this.getEntryAndIndexForKey(key);
			if (result) {
				arrayRemoveAt(this.entries, result[0]);
				return result[1];
			}
			return null;
		},

		addEntry: function(key, value) {
			this.entries[this.entries.length] = [key, value];
		},

		keys: createBucketLister(0),

		values: createBucketLister(1),

		getEntries: function(entries) {
			var startIndex = entries.length;
			for (var i = 0, len = this.entries.length; i < len; ++i) {
				// Clone the entry stored in the bucket before adding to array
				entries[startIndex + i] = this.entries[i].slice(0);
			}
		},

		containsKey: createBucketSearcher(EXISTENCE),

		containsValue: function(value) {
			var i = this.entries.length;
			while (i--) {
				if ( value === this.entries[i][1] ) {
					return true;
				}
			}
			return false;
		}
	};

	/*----------------------------------------------------------------------------------------------------------------*/

	// Supporting functions for searching hashtable buckets

	function searchBuckets(buckets, hash) {
		var i = buckets.length, bucket;
		while (i--) {
			bucket = buckets[i];
			if (hash === bucket[0]) {
				return i;
			}
		}
		return null;
	}

	function getBucketForHash(bucketsByHash, hash) {
		var bucket = bucketsByHash[hash];

		// Check that this is a genuine bucket and not something inherited from the bucketsByHash's prototype
		return ( bucket && (bucket instanceof Bucket) ) ? bucket : null;
	}

	/*----------------------------------------------------------------------------------------------------------------*/

	function Hashtable(hashingFunctionParam, equalityFunctionParam) {
		var that = this;
		var buckets = [];
		var bucketsByHash = {};

		var hashingFunction = (typeof hashingFunctionParam == FUNCTION) ? hashingFunctionParam : hashObject;
		var equalityFunction = (typeof equalityFunctionParam == FUNCTION) ? equalityFunctionParam : null;

		this.put = function(key, value) {
			checkKey(key);
			checkValue(value);
			var hash = hashingFunction(key), bucket, bucketEntry, oldValue = null;

			// Check if a bucket exists for the bucket key
			bucket = getBucketForHash(bucketsByHash, hash);
			if (bucket) {
				// Check this bucket to see if it already contains this key
				bucketEntry = bucket.getEntryForKey(key);
				if (bucketEntry) {
					// This bucket entry is the current mapping of key to value, so replace old value and we're done.
					oldValue = bucketEntry[1];
					bucketEntry[0] = key;
					bucketEntry[1] = value;
				} else {
					// The bucket does not contain an entry for this key, so add one
					bucket.addEntry(key, value);
				}
			} else {
				// No bucket exists for the key, so create one and put our key/value mapping in
				bucket = new Bucket(hash, key, value, equalityFunction);
				buckets[buckets.length] = bucket;
				bucketsByHash[hash] = bucket;
			}
			return oldValue;
		};

		this.get = function(key) {
			checkKey(key);

			var hash = hashingFunction(key);

			// Check if a bucket exists for the bucket key
			var bucket = getBucketForHash(bucketsByHash, hash);
			if (bucket) {
				// Check this bucket to see if it contains this key
				var bucketEntry = bucket.getEntryForKey(key);
				if (bucketEntry) {
					// This bucket entry is the current mapping of key to value, so return the value.
					return bucketEntry[1];
				}
			}
			return null;
		};

		this.containsKey = function(key) {
			checkKey(key);
			var bucketKey = hashingFunction(key);

			// Check if a bucket exists for the bucket key
			var bucket = getBucketForHash(bucketsByHash, bucketKey);

			return bucket ? bucket.containsKey(key) : false;
		};

		this.containsValue = function(value) {
			checkValue(value);
			var i = buckets.length;
			while (i--) {
				if (buckets[i].containsValue(value)) {
					return true;
				}
			}
			return false;
		};

		this.clear = function() {
			buckets.length = 0;
			bucketsByHash = {};
		};

		this.isEmpty = function() {
			return !buckets.length;
		};

		var createBucketAggregator = function(bucketFuncName) {
			return function() {
				var aggregated = [], i = buckets.length;
				while (i--) {
					buckets[i][bucketFuncName](aggregated);
				}
				return aggregated;
			};
		};

		this.keys = createBucketAggregator("keys");
		this.values = createBucketAggregator("values");
		this.entries = createBucketAggregator("getEntries");

		this.remove = function(key) {
			checkKey(key);

			var hash = hashingFunction(key), bucketIndex, oldValue = null;

			// Check if a bucket exists for the bucket key
			var bucket = getBucketForHash(bucketsByHash, hash);

			if (bucket) {
				// Remove entry from this bucket for this key
				oldValue = bucket.removeEntryForKey(key);
				if (oldValue !== null) {
					// Entry was removed, so check if bucket is empty
					if (!bucket.entries.length) {
						// Bucket is empty, so remove it from the bucket collections
						bucketIndex = searchBuckets(buckets, hash);
						arrayRemoveAt(buckets, bucketIndex);
						delete bucketsByHash[hash];
					}
				}
			}
			return oldValue;
		};

		this.size = function() {
			var total = 0, i = buckets.length;
			while (i--) {
				total += buckets[i].entries.length;
			}
			return total;
		};

		this.each = function(callback) {
			var entries = that.entries(), i = entries.length, entry;
			while (i--) {
				entry = entries[i];
				callback(entry[0], entry[1]);
			}
		};

		this.putAll = function(hashtable, conflictCallback) {
			var entries = hashtable.entries();
			var entry, key, value, thisValue, i = entries.length;
			var hasConflictCallback = (typeof conflictCallback == FUNCTION);
			while (i--) {
				entry = entries[i];
				key = entry[0];
				value = entry[1];

				// Check for a conflict. The default behaviour is to overwrite the value for an existing key
				if ( hasConflictCallback && (thisValue = that.get(key)) ) {
					value = conflictCallback(key, thisValue, value);
				}
				that.put(key, value);
			}
		};

		this.clone = function() {
			var clone = new Hashtable(hashingFunctionParam, equalityFunctionParam);
			clone.putAll(that);
			return clone;
		};
	}

	return Hashtable;
})();


//vendor/jshashset ======================================================
/**
 * Copyright 2010 Tim Down.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * HashSet
 *
 * This is a JavaScript implementation of HashSet, similar in concept to those found in Java or C#'s standard libraries.
 * It is distributed as part of jshashtable and depends on jshashtable.js. It creates a single constructor function
 * called HashSet in the global scope.
 *
 * Author: Tim Down <tim@timdown.co.uk>
 * Version: 2.1
 * Build date: 27 March 2010
 * Website: http://www.timdown.co.uk/jshashtable/
 */

HashSet = function(hashingFunction, equalityFunction) {
    var hashTable = new Hashtable(hashingFunction, equalityFunction);

    this.add = function(o) {
        hashTable.put(o, true);
    };

    this.addAll = function(arr) {
        var i = arr.length;
        while (i--) {
            hashTable.put(arr[i], true);
        }
    };

    this.values = function() {
        return hashTable.keys();
    };

    this.remove = function(o) {
        return hashTable.remove(o) ? o : null;
    };

    this.contains = function(o) {
        return hashTable.containsKey(o);
    };

    this.clear = function() {
        hashTable.clear();
    };

    this.size = function() {
        return hashTable.size();
    };

    this.isEmpty = function() {
        return hashTable.isEmpty();
    };

    this.clone = function() {
        var h = new HashSet(hashingFunction, equalityFunction);
        h.addAll(hashTable.keys());
        return h;
    };

    this.intersection = function(hashSet) {
        var intersection = new HashSet(hashingFunction, equalityFunction);
        var values = hashSet.values(), i = values.length, val;
        while (i--) {
            val = values[i];
            if (hashTable.containsKey(val)) {
                intersection.add(val);
            }
        }
        return intersection;
    };

    this.union = function(hashSet) {
        var union = this.clone();
        var values = hashSet.values(), i = values.length, val;
        while (i--) {
            val = values[i];
            if (!hashTable.containsKey(val)) {
                union.add(val);
            }
        }
        return union;
    };

    this.isSubsetOf = function(hashSet) {
        var values = hashTable.keys(), i = values.length;
        while (i--) {
            if (!hashSet.contains(values[i])) {
                return false;
            }
        }
        return true;
    };
}



//knit/engine/memory/base_relation ======================================================

knit.engine.memory.BaseRelation = (function() {
  
  var _ = knit._util,
      _id = 0,
      C = function(name, attributeNamesAndTypes, primaryKey, rows, costSoFar) {
            _id += 1
            this._id = "memory_" + _id + "_" + name
            this._name = name
            var self = this

            if (attributeNamesAndTypes.constructor == knit.Attributes) {
              this._attributes = attributeNamesAndTypes //confusingly enough...
            } else {
              var attributes = []
              _.each(attributeNamesAndTypes, function(nameAndType){
                var attrToAdd = null
                if (nameAndType.name) {
                  attrToAdd = nameAndType
                } else if (nameAndType.push) {
                  var attributeName = nameAndType[0],
                      attributeType = nameAndType[1]
                  attrToAdd = new knit.engine.memory.Attribute(attributeName, attributeType, self)
                } else {
                  var nestedAttributeName = _.keys(nameAndType)[0],
                      nestedRelation = _.values(nameAndType)[0]
                  attrToAdd = new knit.engine.memory.NestedAttribute(nestedAttributeName, nestedRelation, self)
                }

                attributes.push(attrToAdd)
              })      
              this._attributes = new knit.Attributes(attributes)
            }

            this._pkAttributeNames = primaryKey || []
            var pkPositions = _.indexesOf(this._attributes.names(), this._pkAttributeNames)
            
            this._rowStore = 
              new HashSet(function(row){return 1 /* compare every object, always.  inefficient for now. */}, 
                          function(aRow,bRow){
                            return _.empty(pkPositions) ? 
                              false : 
                              _.deepEqual(_.get(aRow, pkPositions), _.get(bRow, pkPositions))})
            this._rowStore.addAll(rows || [])
            this._cost = costSoFar || 0
          },
      p = C.prototype
      
  knit.mixin.relationDefaults(p)
  
  p.defaultCompiler = function() { return knit.UseAlgorithms.expressionCompiler() }
  
  p.id = function(){ return this._id }
  p.name = function(){ return this._name }
  p.cost = function(){ return this._cost }
  p.attributes = function(){ return this._attributes }
  p.attr = function() { return this.attributes().get(_.toArray(arguments)) }
  p.rows = function() { 
    var pkPositions = _.indexesOf(this._attributes.names(), this._pkAttributeNames)
    return _.empty(pkPositions) ? 
            this._rowStore.values() : 
            _.sort(this._rowStore.values(), function(aRow, bRow){
              var allLessThan = !(_.detect(pkPositions, function(position){return aRow[position] > bRow[position]}))
              return allLessThan ? 1 : -1
            })
  }
  
  p.isSame = function(other) { return other.id && this.id() == other.id() }
  p.isEquivalent = function(other) {
    return _.quacksLike(other, knit.signature.relation) &&
           this.attributes().isEquivalent(other.attributes())
  }
  
  p.inspect = function() { return this.name() + "[" + this.attributes().inspect() + "]" }
  
  
  p.newNestedAttribute = function(attributeName, attributesToNest) {
    var nestedRelation = new C("(nested)", attributesToNest, [], [], 0) 
    return new knit.engine.memory.NestedAttribute(attributeName, nestedRelation, this)
  }

  return C
})()

knit.engine.memory.MutableBaseRelation = function(name, attributeNamesAndTypes, primaryKey) {
  
  var result = new knit.engine.memory.BaseRelation(name, attributeNamesAndTypes, primaryKey)
  knit._util.extend(result, {
    merge: function(rowsToAdd) {
      this._rowStore.addAll(rowsToAdd)
      return this
    }
  })
  return result
}

