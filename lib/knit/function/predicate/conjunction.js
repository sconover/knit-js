require("knit/core")

knit.function.predicate.Conjunction = function(leftPredicate, rightPredicate) { //har
  this.leftPredicate = leftPredicate
  this.rightPredicate = rightPredicate
}

knit.function.predicate.Conjunction.prototype.isSame = function(other) {
  return other.constructor == knit.function.predicate.Conjunction && 
         this.leftPredicate.isSame(other.leftPredicate) &&
         this.rightPredicate.isSame(other.rightPredicate)
}

// knit.JoinFunction.prototype.isEquivalent = function(other) {
//   return this.isSame(other)
// }


knit.locals.conjunction = function(leftPredicate, rightPredicate) {
  return new knit.function.predicate.Conjunction(leftPredicate, rightPredicate)
}

knit.locals.and = knit.locals.conjunction