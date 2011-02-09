require("knit/core/dsl_function")

knit.createBuilderFunction = function(setup) {
  var bindings = typeof setup.bindings == "function" ? setup.bindings : function(){return setup.bindings}

  var referenceResolvingWrapper = function() {
    var dslFunction = new DSLFunction()
    knit._util.extend(dslFunction.dslLocals, knit.createBuilderFunction.dslLocals)
    var environment = new knit.ReferenceEnvironment()
    environment.decorate(dslFunction.dslLocals, bindings)

    var result = dslFunction.apply(null, arguments)
    environment.resolve(bindings())
    return result
  }
  return referenceResolvingWrapper
}

knit.createBuilderFunction.dslLocals = {}