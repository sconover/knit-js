//internal utilities

var _ = module.exports = {

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
      var args = _.toArray(arguments)
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
    _.each(_.keys(signature), function(methodNameToDelegate) {
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
      for (var key in objA) if (!(key in objB) || !_.deepEqual(objA[key], objB[key], equalsMethodName)) return false
      return true
    }
    
    if (a===b) return true
    if (typeof a != typeof b) return false
    if ((a===null || b===null) && a!=b) return false
    if (this.isArray(a) && this.isArray(b)) {
      if (a.length != b.length) return false

      var i = a.length
      while (i--) { if ( ! _.deepEqual(a[i], b[i], equalsMethodName)) return false } //hrm
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
  
  deepSame:function(a,b) { return _.deepEqual(a,b, "isSame") },
  deepSameThisVsOther:function(other) { return _.deepSame(this, other) }
  
}

var CollectionFunctions = require("collection_functions")
_.extend(module.exports, CollectionFunctions.Array.functions)