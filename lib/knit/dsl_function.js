//see http://alexyoung.org/2009/10/22/javascript-dsl/

DSLFunction = function() {
  var dslLocals = {}
  var outerFunction = function(userFunction, what_theKeywordThis_IsSupposedToBe){
    if (what_theKeywordThis_IsSupposedToBe == undefined) {
      what_theKeywordThis_IsSupposedToBe = this
    }
    
    var localNames = []
    var localValues = []
    _.each(_.keys(dslLocals), function(key){
      localNames.push(key)
      localValues.push(dslLocals[key])
    })
    
    var userFunctionBody = "(_.bind(" + userFunction.toString().replace(/\s+$/, "") + ",this))()"
    var wrappingFunctionBody = "(function(" + localNames.join(",") + "){return " + userFunctionBody + "})"
    return eval(wrappingFunctionBody).apply(what_theKeywordThis_IsSupposedToBe, localValues)
  }
  outerFunction.dslLocals = dslLocals
  return outerFunction
}

