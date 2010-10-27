require("underscore")

//see http://alexyoung.org/2009/10/22/javascript-dsl/

DSLFunction = function() {
  var locals = {}
  var outerFunction = function(userFunction, whatThisIsSupposedToBe){
    if (whatThisIsSupposedToBe == undefined) {
      whatThisIsSupposedToBe = this
    }
    
    var localNames = []
    var localValues = []
    _.each(_.keys(locals), function(key){
      localNames.push(key)
      localValues.push(locals[key])
    })
    
    var userFunctionBody = "(_.bind(" + userFunction.toString().replace(/\s+$/, "") + ",this))()"
    var wrappingFunctionBody = "(function(" + localNames.join(",") + "){return " + userFunctionBody + "})"
    return eval(wrappingFunctionBody).apply(whatThisIsSupposedToBe, localValues)
  }
  outerFunction.locals = locals
  return outerFunction
}

