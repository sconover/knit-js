require("knit/core")
var Equality = require("knit/algebra/predicate/equality").Equality

var True = module.exports.True = function() {
  return new Equality(1,1)
}
module.exports.True.dslLocals = {TRUE: new True()}

var False = module.exports.False = function() {
  return new Equality(1,2)
}
module.exports.False.dslLocals = {FALSE: new False()}
