CollectionFunctions = (function(){  

  var arrayCFDefinition = function() {
    var arrayIterator = function(collection){
      var position = 0
      return {
        next: function() {
          var result = collection[position]
          position += 1
          return result
        },
        hasNext: function(){return position<collection.length}
      }
    }
    var nothing = function(){return null}
    var doubleEquals = function(a,b){return a == b}
    var newArray = function(){return []}
    var arrayPush = function(array, item){ array.push(item) }
    var isArray = function(thing){ return typeof thing.length != "undefined" }
    return [arrayIterator, nothing, doubleEquals, newArray, arrayPush, isArray]
  }()

  var mainFunction = function(
    user__iterator, user__nothing, user__equals, 
    user__newCollection, user__append, user__isCollection) {
  
    var factory = (function me(
        __iterator, __nothing, __equals, 
        __newCollection, __append, __isCollection,
        arrayFunctions,
        createAcrossCF) {
        
      var createAcrossCF = createAcrossCF==false ? false : true
      var cost = __nothing()
      var breaker = {}

      function lastCost(){ return cost }

      function newIterator(collection) {
        return __iterator(collection)
      }

      function each(collection, callback) {
        cost = 0
        var count = 0
  
        var iteratorInstance = newIterator(collection)
        while (iteratorInstance.hasNext()) {
          var item=iteratorInstance.next()
          cost += 1
          var result = callback(item, count)
          if (result === breaker) break
          count += 1
        }
      }

      function detect(collection, matcher) {
        var hit = __nothing()
        each(collection, function(item, i){
          if (matcher(item, i)) {
            hit = item
            return breaker
          }
        })
        return hit
      }

      function select(collection, matcher) {
        var newCollection = __newCollection()
        each(collection, function(item, i){
          if (matcher(item, i)) __append(newCollection, item)
        })
        return newCollection
      }

      function map(collection, transformer, newCollectionF, appenderF) {
        newCollectionF = newCollectionF || function(){return []}
        appenderF = appenderF  || function(arr, item){arr.push(item)}
  
        var newCollection = newCollectionF()
        each(collection, function(item, i){
          appenderF(newCollection, transformer(item, i))
        })
        return newCollection
      }
      
      function pluck(collection, property) {
        return map(collection, function(item){
          var value = item[property]
          if (typeof value == "function") {
            value = value()
          }
          return value
        })
      }

      function include(collection, findMe) {
        var index = __nothing()
        detect(collection, function(item, i){
          if (__equals(item, findMe)) {
            index = i
            return true
          }
        })
        return index
      }

      function flatten(collection) {
        var newCollection = __newCollection()
        each(collection, function(item){
          if (__isCollection(item)) {
            var itemFlattened = flatten(item)
            each(itemFlattened, function(item) {
              __append(newCollection, item)
            })
          } else {
            __append(newCollection, item)
          }
        })
        return newCollection
      }

      function concat() {
        var newCollection = __newCollection()
        var totalCost = 0
        arrayFunctions.each(arguments, function(collection){
          each(collection, function(item){__append(newCollection, item)})
          totalCost += cost
        })
        cost = totalCost
        return newCollection
      }


      /*
      Hey look my head is hurting too.  But this is worth it, I think! (?)
      We're expressing multi-collection capability through CF itself,
      meaning you get multi-collection detect, map, etc for free.  Yay!
      */
      var acrossCF = arrayFunctions && createAcrossCF ?
        function(){
  
          var multiCollectionIterator = function(collections){
            var iteratorInstances = arrayFunctions.map(collections, function(collection){return newIterator(collection)})
    
            return {
              next: function() {
                return arrayFunctions.map(iteratorInstances, function(iterator){
                  return iterator.hasNext() ? iterator.next() : __nothing()
                }, __newCollection, __append)
              },
              hasNext: function(){
                return arrayFunctions.detect(iteratorInstances, function(iterator){return iterator.hasNext()})
              }
            }
          }

          var multiCollectionEquals = function(collectionA, collectionB){
            return equals(collectionA, collectionB)
          }
  
          var isCollectionDoesntMakeSenseWhenCollectionsAreNested = undefined
          var createAcrossCF = false //it's a way to stop recursion.  think about this.
    
          return me(multiCollectionIterator, __nothing, multiCollectionEquals, 
                    __newCollection, __append, isCollectionDoesntMakeSenseWhenCollectionsAreNested, 
                    arrayFunctions,
                    createAcrossCF)
        }() :
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
          var iter = __iterator(pairCollection)
          var a = iter.next()
          var b = iter.next()
          return !__equals(a, b)
        })
        cost = acrossAB.lastCost()
        return !foundNotEqual
      }

      function size(collection) {
        //efficiency later
        var count = 0
        each(collection, function() { count += 1 })
        return count
      }

      function slice(collection, a, b) {
        function sliceStartPlusLength(collection, startPos, length) {
          var newCollection = __newCollection()
          each(collection, function(item, i) {
            if (i>=startPos) __append(newCollection, item)
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

      function splice(mainCollection, spliceInCollection, insertAtIndex, overwriteLength) {
        overwriteLength = overwriteLength || 0
        return concat(slice(mainCollection, [0, insertAtIndex-1]),
                      spliceInCollection, 
                      slice(mainCollection, [insertAtIndex + overwriteLength, -1]))
      }
      
      function inspect(collection) {
        var strings = []
        each(collection, function(item){ 
          strings.push(typeof item.inspect == "function" ? item.inspect() : "" + item)
        })
        return strings.join(",")
      }
      

      function specialCurry(func, collectionFunc) {
        return function() {
          var args = []
          for(key in arguments){args[key] = arguments[key]}

          args.unshift(collectionFunc.apply(this, []))
          return func.apply(null, args)
        }
      }

      var functions = {
        lastCost: lastCost,
        newIterator: newIterator,
        each: each,
        detect: detect,
        select: select,
        map: map,
        pluck: pluck,
        include: include,
        flatten: flatten,
        concat: concat,
        clone: concat,
        all: concat,
        slice: slice,
        splice: splice,
        size: size,
        equals: equals,
        inspect: inspect
      }
  
      if (createAcrossCF) { //can't do across across because we would all die
        functions.across = across
        functions.zip = zip
      }
  
  

      function makeObjectStyleFunctions(collectionGetter) {
        var curried = {}
        for(k in functions){curried[k] = specialCurry(functions[k], collectionGetter)}
        return curried
      }

      return {
        functions:functions,
        decorate: function(target){for(k in functions){target[k] = functions[k]}},
        makeObjectStyleFunctions: makeObjectStyleFunctions,
        decorateObjectStyle: function(target, collectionGetter){
          var curriedFunctions = makeObjectStyleFunctions(collectionGetter)
          for(k in curriedFunctions){target[k] = curriedFunctions[k]}
        }
      }
    }) //end factory

    var arrayCF = factory.apply(null, arrayCFDefinition)
  
    return factory(user__iterator, user__nothing, user__equals, 
                   user__newCollection, user__append, user__isCollection,
                   arrayCF.functions)
  }
  mainFunction.Array = mainFunction.apply(null, arrayCFDefinition) //convenience
  return mainFunction
})()