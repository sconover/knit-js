if (!(typeof window === 'undefined')) global=window

require("knit/dsl_function")

global.knit = function(){
  this.algebra = {predicate:{}}
  this.mixin = {}
  this.engine = {}
  
  //hrm.  begone.
  this.engine.sql = {statement:{}}
  
  this.dslLocals = {} //do this differently now?
  
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
}()

require("knit/quacks_like")
require("knit/reference")
require("knit/rows_and_objects")

global.knit.signature = function(){
  var like = {isSame:Function, isEquivalent:Function}
  
  var signatures = {}
  
  signatures.attribute = _.extend({name:Function, sourceRelation:Function}, like)
  signatures.nestedAttribute = _.extend({nestedRelation:Function}, signatures.attribute)
  signatures.relation = _.extend({attributes:Function, split:Function, merge:Function, newNestedAttribute:Function}, like)
  signatures.join = _.extend({relationOne:Object, relationTwo:Object, predicate:Object}, signatures.relation)

  return signatures
}()

global.knit.createBuilderFunction = function(setup) {
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

global.knit.indexOfSame = function(things, thing) {
  var index = null
  for(var i=0; i<things.length; i++) {
    if (things[i].isSame(thing)) {
      index = i
      break
    }
  }
  return index
}