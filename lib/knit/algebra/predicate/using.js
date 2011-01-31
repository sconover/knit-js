require("knit/core")

knit.algebra.predicate.Using = function(attributeNames) {
  
}

knit.createBuilderFunction.dslLocals.using = function(attributeNames) {
  return new knit.algebra.predicate.Using(attributeNames)
}
