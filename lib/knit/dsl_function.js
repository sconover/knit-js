//see http://alexyoung.org/2009/10/22/javascript-dsl/

DSLFunction = function() {
  var dslLocals = {}
  var outerFunction = function(userFunction, whatThisIsSupposedToBe){
    if (whatThisIsSupposedToBe == undefined) {
      whatThisIsSupposedToBe = this
    }
    
    var localNames = []
    var localValues = []
    _.each(_.keys(dslLocals), function(key){
      localNames.push(key)
      localValues.push(dslLocals[key])
    })
    
    var userFunctionBody = "(_.bind(" + userFunction.toString().replace(/\s+$/, "") + ",this))()"
    var wrappingFunctionBody = "(function(" + localNames.join(",") + "){return " + userFunctionBody + "})"
    return eval(wrappingFunctionBody).apply(whatThisIsSupposedToBe, localValues)
  }
  outerFunction.dslLocals = dslLocals
  return outerFunction
}

