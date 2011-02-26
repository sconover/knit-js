require("knit/core")

knit.algebra.predicate.Conjunction = (function(){
  
  var _ = knit._util,
      C = function(leftPredicate, rightPredicate) {
            this.leftPredicate = leftPredicate
            this.rightPredicate = rightPredicate
          },
      p = C.prototype

  p.concernedWithNoOtherRelationsBesides = function() {
    var expectedExclusiveRelations = _.toArray(arguments)
    return this.leftPredicate.concernedWithNoOtherRelationsBesides.apply(this.leftPredicate, expectedExclusiveRelations) &&
           this.rightPredicate.concernedWithNoOtherRelationsBesides.apply(this.rightPredicate, expectedExclusiveRelations)
  }
  
  p.concernedWithAllOf = function() {
    var expectedRelations = _.toArray(arguments),
        self = this,
        remainingRelations = _.select(expectedRelations, function(relation){
          return ! (self.leftPredicate.concernedWithAllOf(relation) || self.rightPredicate.concernedWithAllOf(relation))
        })

    return _.empty(remainingRelations)
  }
      
  p.isSame = function(other) {
    return other.constructor == C && 
           this.leftPredicate.isSame(other.leftPredicate) &&
           this.rightPredicate.isSame(other.rightPredicate)
  }
  
  p.isEquivalent = function(other) {
    return this.isSame(other) ||
             other.constructor == C && 
             this.leftPredicate.isEquivalent(other.rightPredicate) &&
             this.rightPredicate.isEquivalent(other.leftPredicate)
  }
  
  p.inspect = function() { return "and(" + this.leftPredicate.inspect() + "," + 
                                           this.rightPredicate.inspect() + ")" }
  
  return C
})()

knit.createBuilderFunction.dslLocals.conjunction = function(leftPredicate, rightPredicate) {
  return new knit.algebra.predicate.Conjunction(leftPredicate, rightPredicate)
}

knit.createBuilderFunction.dslLocals.and = knit.createBuilderFunction.dslLocals.conjunction