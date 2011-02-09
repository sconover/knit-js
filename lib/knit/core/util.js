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