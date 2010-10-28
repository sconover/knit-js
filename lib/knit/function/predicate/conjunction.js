require("knit/core")

knit.function.predicate.Conjunction = function(leftPredicate, rightPredicate) { //har
  this.leftPredicate = leftPredicate
  this.rightPredicate = rightPredicate
}

_.extend(knit.function.predicate.Conjunction.prototype, {
  onlyConcernedWith: function(relation) {
    return this.leftPredicate.onlyConcernedWith(relation) && 
           this.rightPredicate.onlyConcernedWith(relation)
  },
  
  isSame: function(other) {
    return other.constructor == knit.function.predicate.Conjunction && 
           this.leftPredicate.isSame(other.leftPredicate) &&
           this.rightPredicate.isSame(other.rightPredicate)
  },
  
  isEquivalent: function(other) {
    return this.isSame(other) ||
             other.constructor == knit.function.predicate.Conjunction && 
             this.leftPredicate.isEquivalent(other.rightPredicate) &&
             this.rightPredicate.isEquivalent(other.leftPredicate)
  },
  
  inspect: function() {return "and(" + this.leftPredicate.inspect() + "," + 
                                       this.rightPredicate.inspect() + ")" }
})

knit.locals.conjunction = function(leftPredicate, rightPredicate) {
  return new knit.function.predicate.Conjunction(leftPredicate, rightPredicate)
}

knit.locals.and = knit.locals.conjunction