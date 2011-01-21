require("knit/core")

knit.algebra.predicate.Conjunction = function(){

  var F = function(leftPredicate, rightPredicate) { //har
    this.leftPredicate = leftPredicate
    this.rightPredicate = rightPredicate
  }

  F.prototype.concernedWithNoOtherRelationsBesides = function() {
    var expectedExclusiveRelations = _.toArray(arguments)
    return this.leftPredicate.concernedWithNoOtherRelationsBesides.apply(this.leftPredicate, expectedExclusiveRelations) &&
           this.rightPredicate.concernedWithNoOtherRelationsBesides.apply(this.rightPredicate, expectedExclusiveRelations)
  }
  
  F.prototype.concernedWithAllOf = function() {
    var expectedRelations = _.toArray(arguments)
  
    var self = this
    var remainingRelations = _.reject(expectedRelations, function(relation){
      return self.leftPredicate.concernedWithAllOf(relation) || self.rightPredicate.concernedWithAllOf(relation)
    })

    return _.isEmpty(remainingRelations)
  }
      
  F.prototype.isSame = function(other) {
    return other.constructor == F && 
           this.leftPredicate.isSame(other.leftPredicate) &&
           this.rightPredicate.isSame(other.rightPredicate)
  }
  
  F.prototype.isEquivalent = function(other) {
    return this.isSame(other) ||
             other.constructor == F && 
             this.leftPredicate.isEquivalent(other.rightPredicate) &&
             this.rightPredicate.isEquivalent(other.leftPredicate)
  }
  
  F.prototype.inspect = function() {
    return "and(" + this.leftPredicate.inspect() + "," + 
           this.rightPredicate.inspect() + ")" 
  }
  
  return F
}()

knit.dslLocals.conjunction = function(leftPredicate, rightPredicate) {
  return new knit.algebra.predicate.Conjunction(leftPredicate, rightPredicate)
}

knit.dslLocals.and = knit.dslLocals.conjunction
