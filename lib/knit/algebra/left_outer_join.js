require("knit/core")
require("knit/algebra/join")

knit.algebra.LeftOuterJoin = function(relationOne, relationTwo, predicate) {
  var join = new knit.algebra.Join(relationOne, relationTwo, predicate)
  join.perform = function() {
    return this.relationOne.perform().performLeftOuterJoin(this.relationTwo.perform(), this.predicate)
  }
  return join
}

knit.createBuilderFunction.dslLocals.leftOuterJoin = function(relationOne, relationTwo, predicate) { 
  return new knit.algebra.LeftOuterJoin(relationOne, relationTwo, predicate) 
}