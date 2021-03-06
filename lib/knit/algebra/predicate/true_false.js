require("knit/core")
require("knit/algebra/predicate/equality")

knit.algebra.predicate.True = function() {
  return new knit.algebra.predicate.Equality(1,1)
}
knit.createBuilderFunction.dslLocals.TRUE = new knit.algebra.predicate.True()

knit.algebra.predicate.False = function() {
  return new knit.algebra.predicate.Equality(1,2)
}
knit.createBuilderFunction.dslLocals.FALSE = new knit.algebra.predicate.False()
