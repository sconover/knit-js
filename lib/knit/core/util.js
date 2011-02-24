require("vendor/collection_functions")
//internal utilities
knit._util = {
  
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
    
    for (var i=0; i<toMerges.length; i++) {
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