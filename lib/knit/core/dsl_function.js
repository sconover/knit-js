//see http://alexyoung.org/2009/10/22/javascript-dsl/

global.DSLFunction = (function() {
  var _A = CollectionFunctions.Array.functions,
      _ = knit._util
  
  var dslLocals = {}
  var outerFunction = function(userFunction, what_theKeywordThis_IsSupposedToBe){
    if (what_theKeywordThis_IsSupposedToBe == undefined) {
      what_theKeywordThis_IsSupposedToBe = this
    }
    
    var localNames = []
    var localValues = []
    _A.each(_.keys(dslLocals), function(key){
      localNames.push(key)
      localValues.push(dslLocals[key])
    })
    
    var userFunctionBody = "(knit._util.bind(" + userFunction.toString().replace(/\s+$/, "") + ",this))()"
    var wrappingFunctionBody = "(function(" + localNames.join(",") + "){return " + userFunctionBody + "})"
    return eval(wrappingFunctionBody).apply(what_theKeywordThis_IsSupposedToBe, localValues)
  }
  
  outerFunction.dslLocals = dslLocals
  
  outerFunction.specialize = function(childDslLocals) {
    var allDslLocals = _.extend({}, outerFunction.dslLocals)
    var allDslLocals = _.extend(allDslLocals, childDslLocals)
    var childDslFunction = new DSLFunction()
    _.extend(childDslFunction.dslLocals, allDslLocals)
    return childDslFunction
  }
  
  return outerFunction
})


