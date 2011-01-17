require("knit/dsl_function")

global["knit"] = new DSLFunction()
global.knit.algebra = {}
global.knit.algebra.predicate = {}
global.knit.engine = {}
global.knit.engine.sql = {}
global.knit.engine.sql.statement = {}

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

