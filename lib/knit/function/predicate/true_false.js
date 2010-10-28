require("knit/core")
require("knit/function/predicate/equality")

knit.function.predicate.True = function() {
  return new knit.function.predicate.Equality(1,1)
}

knit.locals.TRUE = new knit.function.predicate.True()


knit.function.predicate.False = function() {
  return new knit.function.predicate.Equality(1,2)
}

knit.locals.FALSE = new knit.function.predicate.False()