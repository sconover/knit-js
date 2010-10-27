require("underscore")
require("knit/dsl_function")

global["knit"] = new DSLFunction()
global.knit.function = global.knit.function || {}
global.knit.function.predicate = global.knit.function.predicate || {}
global.knit.predicate = global.knit.predicate || {}

knit.createObject = function() {
  var o = arguments[0]
  
  function F() {}
  F.prototype = o
  var newObj = new F()
  
  if (arguments.length==2) {
    var additions = arguments[1]
    _.extend(newObj, additions)
  }
  
  return newObj
}

