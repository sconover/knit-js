if (!(typeof window === 'undefined')) global=window

require("knit/dsl_function")

global.knit = function(){
  this.algebra = {predicate:{}}
  this.mixin = {}
  this.engine = {}
  
  //hrm.  begone.
  this.engine.sql = {statement:{}}
  
  //see http://javascript.crockford.com/prototypal.html
  this.createObject = function() {
    var o = arguments[0]

    function __F() {}
    __F.prototype = o
    var newObj = new __F()

    if (arguments.length==2) {
      var additions = arguments[1]
      _.extend(newObj, additions)
    }

    return newObj
  }
  
  return this
}.apply(new global.DSLFunction())

global.knit.makeBuilderFunction = function(setup) {
  var bindings = typeof setup.bindings == "function" ? setup.bindings : function(){return setup.bindings}
  
  var referenceResolvingWrapper = function() {
    var dslFunction = new global.DSLFunction()
    _.extend(dslFunction.dslLocals, global.knit.dslLocals)
    var environment = new knit.ReferenceEnvironment()
    environment.decorate(dslFunction.dslLocals)
    
    var result = dslFunction.apply(null, arguments)
    environment.resolve(bindings())
    return result
  }
  return referenceResolvingWrapper
}