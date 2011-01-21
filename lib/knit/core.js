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

    function F() {}
    F.prototype = o
    var newObj = new F()

    if (arguments.length==2) {
      var additions = arguments[1]
      _.extend(newObj, additions)
    }

    return newObj
  }
  
  return this
}.apply(new global.DSLFunction())