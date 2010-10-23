require("underscore")

//see http://alexyoung.org/2009/10/22/javascript-dsl/

DSLFunction = function() {
  var locals = {}
  var outerFunction = function(userFunction){
    var localNames = []
    var localValues = []
    _.each(_.keys(locals), function(key){
      localNames.push(key)
      localValues.push(locals[key])
    })
    
    var userFunctionBody = "(" + userFunction.toString().replace(/\s+$/, "") + ")()"
    var wrappingFunctionBody = "(function(" + localNames.join(",") + "){" + userFunctionBody + "})"
    return eval(wrappingFunctionBody).apply(this, localValues)
  }
  outerFunction.locals = locals
  return outerFunction
}

