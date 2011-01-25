knit.createBuilderFunction = function(setup) {
  var bindings = typeof setup.bindings == "function" ? setup.bindings : function(){return setup.bindings}

  var referenceResolvingWrapper = function() {
    var dslFunction = new global.DSLFunction()
    _.extend(dslFunction.dslLocals, global.knit.dslLocals)
    var environment = new knit.ReferenceEnvironment()
    environment.decorate(dslFunction.dslLocals, bindings)

    var result = dslFunction.apply(null, arguments)
    environment.resolve(bindings())
    return result
  }
  return referenceResolvingWrapper
}
