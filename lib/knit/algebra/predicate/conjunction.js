require("knit/core")

knit.algebra.predicate.Conjunction = function(leftPredicate, rightPredicate) { //har
  this.leftPredicate = leftPredicate
  this.rightPredicate = rightPredicate
}

_.extend(knit.algebra.predicate.Conjunction.prototype, {
	
	concernedWithNoOtherRelationsBesides: function() {
	  var expectedExclusiveRelations = _.toArray(arguments)
	  return this.leftPredicate.concernedWithNoOtherRelationsBesides.apply(this.leftPredicate, expectedExclusiveRelations) &&
	         this.rightPredicate.concernedWithNoOtherRelationsBesides.apply(this.rightPredicate, expectedExclusiveRelations)
  },
  
	concernedWithAllOf: function() {
	  var expectedRelations = _.toArray(arguments)
		
		var self = this
	  var remainingRelations = _.reject(expectedRelations, function(relation){
	    return self.leftPredicate.concernedWithAllOf(relation) || self.rightPredicate.concernedWithAllOf(relation)
	  })
	
	  return _.isEmpty(remainingRelations)
  },
	
		
  isSame: function(other) {
    return other.constructor == knit.algebra.predicate.Conjunction && 
           this.leftPredicate.isSame(other.leftPredicate) &&
           this.rightPredicate.isSame(other.rightPredicate)
  },
  
  isEquivalent: function(other) {
    return this.isSame(other) ||
             other.constructor == knit.algebra.predicate.Conjunction && 
             this.leftPredicate.isEquivalent(other.rightPredicate) &&
             this.rightPredicate.isEquivalent(other.leftPredicate)
  },
  
  inspect: function() {return "and(" + this.leftPredicate.inspect() + "," + 
                                       this.rightPredicate.inspect() + ")" }
})

knit.dslLocals.conjunction = function(leftPredicate, rightPredicate) {
  return new knit.algebra.predicate.Conjunction(leftPredicate, rightPredicate)
}

knit.dslLocals.and = knit.dslLocals.conjunction