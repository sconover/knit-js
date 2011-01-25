if (!(typeof window === 'undefined')) global=window

require("knit/dsl_function")

global.knit = function(){
  this.algebra = {predicate:{}}
  this.mixin = {}
  this.engine = {}
  
  //hrm.  begone.
  this.engine.sql = {statement:{}}
  
  this.dslLocals = {} //do this differently now?
    
  return this
}()

require("knit/util")
require("knit/quacks_like")
require("knit/reference")
require("knit/rows_and_objects")
require("knit/signatures")
require("knit/builder_function")

