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
    equals:function(a,b){return a == b},
    newCollection:function(){return []},
    append:function(array, item){ array.push(item) },
    isCollection:function(thing){ return typeof thing.length != "undefined" },
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
      
      var featureRequirementBug = function(featureName){
        throw new Error("BUG: a missing feature is required in order to perform this operation. " +
                        "The developer should have prevented this function from being exported.")
      }
      
      var featureNames = ["iterator", "nothing", "equals", "newCollection", 
                          "append", "isCollection", "size", "concat", "comparator", "sort"]
      for (var i=0; i<featureNames.length; i++) {
        var featureName = featureNames[i]
        var halt = featureRequirementBug
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
      
      var createAcrossCF = createAcrossCF==false ? false : true
      var breaker = {}
      var functionsForExport = {}
            
      var iteratorHolder = {iteratorFunction:features.iterator} //so we can wrap/override later
      function iterator(collection) {
        return iteratorHolder.iteratorFunction(collection)
      }
      if (feature("iterator")) functionsForExport.iterator = iterator
      
      function each(collection, callback) {
        var count = 0
  
        var iteratorInstance = iterator(collection)
        while (iteratorInstance.hasNext()) {
          var item=iteratorInstance.next()
          var result = callback(item, count)
          if (result === breaker) break
          count += 1
        }
      }
      if (functionsForExport.iterator) functionsForExport.each = each

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
      if (functionsForExport.each && feature("nothing")) functionsForExport.detect = detect
      

      function select(collection, matcher) {
        var newCollection = features.newCollection()
        each(collection, function(item, i){
          if (matcher(item, i)) features.append(newCollection, item)
        })
        return newCollection
      }
      if (functionsForExport.each && feature("newCollection") && feature("append")) functionsForExport.select = select

      function map(collection, transformer, newCollectionF, appenderF) {
        newCollectionF = newCollectionF || function(){return []}
        appenderF = appenderF  || function(arr, item){arr.push(item)}
  
        var newCollection = newCollectionF()
        each(collection, function(item, i){
          appenderF(newCollection, transformer(item, i))
        })
        return newCollection
      }
      if (functionsForExport.each && feature("newCollection") && feature("append")) functionsForExport.map = map
      
      function pluck(collection, property) {
        return map(collection, function(item){
          var value = item[property]
          if (typeof value == "function") {
            value = value()
          }
          return value
        })
      }
      if (functionsForExport.map) functionsForExport.pluck = pluck

      function isSorted(collection) {
        var sorted = true
        var previousItem = null
        each(collection, function(item, i){
          if (i>=1 && features.comparator(previousItem, item) < 0) {
            sorted = false
            return breaker
          }
          previousItem = item
        })
        return sorted
      }
      if (functionsForExport.each && feature("comparator")) functionsForExport.isSorted = isSorted
      
      var sort = getFeatureIfAvailable("sort") || 
                   function(collection) {
                     var array = map(collection, function(item){return item})
                     array.sort(features.comparator())
                     var sortedCollection = map(array, function(item){return item}, features.newCollection, features.append)
                     return sortedCollection
                   }
      if (feature("sort") || functionsForExport.map && feature("comparator")) functionsForExport.sort = sort

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
      
      function include(collection, findMe) {
        return indexOf(collection, findMe) != features.nothing()
      }
      if (functionsForExport.detect && feature("nothing") && feature("equals")) {
        functionsForExport.indexOf = indexOf
        functionsForExport.include = include
      }
      
      function uniq(collection) {
        var newCollection = features.newCollection()
        each(collection, function(item){
          if (!include(newCollection, item)) features.append(newCollection, item)
        })
        return newCollection
      }
      if (functionsForExport.each && functionsForExport.include && feature("newCollection") && feature("append"))
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
      if (functionsForExport.select && functionsForExport.include && functionsForExport.uniq) {
        functionsForExport.intersect = intersect
        functionsForExport.differ = differ
      }
         
      function without(collection, dontWantThisItem) {
        return select(collection, function(item) {
          return !features.equals(item, dontWantThisItem)
        })
      }
      if (functionsForExport.select && feature("equals")) functionsForExport.without = without
      
      function remove(collection, indexWeDontWant) {
        var newCollection = features.newCollection()
        each(collection, function(item,i) {
          if (i!=indexWeDontWant) features.append(newCollection, item)
        })
        return newCollection
      }
      if (functionsForExport.each && feature("newCollection") && feature("append"))
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
      if (functionsForExport.each && feature("newCollection") && feature("isCollection") && feature("append")) 
        functionsForExport.flatten = flatten
      
      var concat = getFeatureIfAvailable("concat") || 
                     function() {
                       var newCollection = features.newCollection()
                       arrayFunctions.each(arguments, function(collection){
                         each(collection, function(item){features.append(newCollection, item)})
                       })
                       return newCollection
                     }
      if (feature("concat") || feature("newCollection") && feature("append")) 
        functionsForExport.all = functionsForExport.clone = functionsForExport.concat = concat
        
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
          var collections = arrayFunctions.slice(arguments, [0,-2])
          var callback = lastArgument
      
          across.apply(null, collections).each(function(entryCollection, i){
            callback.apply(null, arrayFunctions.map(entryCollection, function(item){return item}).concat([i]) )
          })
        } else {
          var collections = arguments
          return across.apply(null, collections).all()
        }
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
      if (functionsForExport.detect && feature("iterator") && feature("equals") && feature("newCollection")) 
        functionsForExport.equals = equals
      
      var size = getFeatureIfAvailable("size") || 
                   function(collection) {
                     var count = 0
                     each(collection, function() { count += 1 })
                     return count          
                   }
      if (feature("size") || functionsForExport.each) functionsForExport.size = size

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
          var startPos = range[0]
          var endPos = range[1]
    
          if (startPos>=0 && endPos>=0) {
            return sliceStartPlusLength(collection, startPos, endPos-startPos+1)
          } else {
            var theSize = size(collection)
            var positiveStartPos = startPos<0 ? theSize + startPos : startPos
            var positiveEndPos = endPos<0 ? theSize + endPos : endPos
            return sliceRange(collection, [positiveStartPos, positiveEndPos])
          }
        }
  
        if (typeof a.length != "undefined") {
          var range = a
          return sliceRange(collection, range)
        } else {
          var startPos = a
          var length = b
          return sliceStartPlusLength(collection, startPos, length)
        }
      }
      if (functionsForExport.each && feature("newCollection") && feature("append")) functionsForExport.slice = slice

      function splice(mainCollection, spliceInCollection, insertAtIndex, overwriteLength) {
        overwriteLength = overwriteLength || 0
        return concat(slice(mainCollection, [0, insertAtIndex-1]),
                      spliceInCollection, 
                      slice(mainCollection, [insertAtIndex + overwriteLength, -1]))
      }
      if (functionsForExport.concat && functionsForExport.slice) functionsForExport.splice = splice
      
      function inspect(collection) {
        var strings = []
        each(collection, function(item){ 
          strings.push(typeof item.inspect == "function" ? item.inspect() : "" + item)
        })
        return strings.join(",")
      }
      if (functionsForExport.each) functionsForExport.inspect = inspect

      function specialCurry(func, collectionFunc) {
        return function() {
          var args = []
          for(key in arguments){args[key] = arguments[key]}

          args.unshift(collectionFunc.apply(this, []))
          return func.apply(null, args)
        }
      }

      if (createAcrossCF) { //can't do across across because we would all die
        functionsForExport.across = across
        functionsForExport.zip = zip
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
            var args = arrayFunctions.map(arguments, function(arg){return arg})
            var result = inner.apply(this, args)
            return result                      
          }
        }
        
        for (k in functions) {
          wrappedFunctions[k] = makeCostResettingWrapper(functions[k])
        }
        
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
        
        wrappedFunctions.lastCost = function() {
          return iteratorHolder._callsToNext
        }
        
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
      
      var originalExports = makeExports(functionsForExport)
      var layeredStatsExports = makeExports(layerOnCostTracking(functionsForExport))
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
  
  mainFunction.Array = mainFunction.apply(null, [standardArrayFeatures]) //convenience

  return mainFunction
})()