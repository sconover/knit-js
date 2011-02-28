require("knit/core/dsl_function")
var _ = require("knit/core/util")
var _DSLFunction = require("knit/core/dsl_function")

knit.createBuilderFunction = function(setup) {

  function convenienceMemoryRelationConversion(rawBindings) {
    var bindings = {}
    _.each(_.keys(rawBindings), function(name){
      var rawRelation = rawBindings[name],
          stringAttributes = _.map(rawRelation.attributes, function(attribute){return [attribute, knit.attributeType.String]}),
          inMemoryBaseRelation = new knit.engine.memory.MutableBaseRelation(name, stringAttributes)

      inMemoryBaseRelation.merge(rawRelation.rows)
      bindings[name] = inMemoryBaseRelation      
    })
    return bindings
  }
  
  var bindings = null
  if (setup.bindings) {
    if (typeof setup.bindings == "function") {
      bindings = setup.bindings
    } else {
      bindings = function(){return setup.bindings}
    }
  } else {
    bindings = function(){return convenienceMemoryRelationConversion(setup)}
  }
  
  var referenceResolvingWrapper = function() {
    var dslFunction = new _DSLFunction()
    _.extend(dslFunction.dslLocals, knit.createBuilderFunction.dslLocals)
    var environment = new knit.ReferenceEnvironment()
    environment.decorate(dslFunction.dslLocals, bindings)

    var result = dslFunction.apply(null, arguments)
    environment.resolve(bindings())
    return result
  }
  return referenceResolvingWrapper
}

knit.createBuilderFunction.dslLocals = {}

;(function() {
  //switcheroo
  
  var oldKnit = global.knit
  global.knit = _.extend(knit.createBuilderFunction, oldKnit)
})()