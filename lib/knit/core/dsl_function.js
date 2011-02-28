var _ = require("knit/core/util")

//see http://alexyoung.org/2009/10/22/javascript-dsl/
var _DSLFunction = module.exports = function() {
  var dslLocals = {},
      outerFunction = function(userFunction, what_theKeywordThis_IsSupposedToBe){
        if (what_theKeywordThis_IsSupposedToBe === undefined) {
          what_theKeywordThis_IsSupposedToBe = this
        }
    
        var localNames = [],
            localValues = []
        _.each(_.keys(dslLocals), function(key){
          localNames.push(key)
          localValues.push(dslLocals[key])
        })
    
        var userFunctionBody = "(require('knit/core/util').bind(" + 
                               userFunction.toString().replace(/\s+$/, "") + 
                               ",this))()",
            wrappingFunctionBody = "(function(" + localNames.join(",") + "){return " + userFunctionBody + "})"
        return eval(wrappingFunctionBody).apply(what_theKeywordThis_IsSupposedToBe, localValues)
      }
  
  return _.extend(outerFunction, {

    dslLocals:dslLocals,

    specialize: function(childDslLocals) {
      var allDslLocals = _.extend({}, outerFunction.dslLocals, childDslLocals)
      var childDslFunction = new _DSLFunction()
      _.extend(childDslFunction.dslLocals, allDslLocals)
      return childDslFunction
    }

  }) 
}