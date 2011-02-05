//see http://javascript.crockford.com/prototypal.html
knit.createObject = function() {
  var o = arguments[0]

  function __F() {}
  __F.prototype = o
  var newObj = new __F()

  if (arguments.length==2) {
    var additions = arguments[1]
    _.extend(newObj, additions)
  }

  return newObj
}


//taken from underscore.js
knit.bind = function(f, objectThatShouldBeThis) {
  return function() {
    var args = CollectionFunctions.Array.functions.toArray(arguments)
    return f.apply(objectThatShouldBeThis, args)
  }
}