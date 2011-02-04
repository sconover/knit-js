require("knit/core")

knit.algebra.predicate.Conjunction = function(){
  var _A = CollectionFunctions.Array.functions
  
  var F = function(leftPredicate, rightPredicate) { //har
    this.leftPredicate = leftPredicate
    this.rightPredicate = rightPredicate
  }; var p = F.prototype

  p.concernedWithNoOtherRelationsBesides = function() {
    var expectedExclusiveRelations = _A.toArray(arguments)
    return this.leftPredicate.concernedWithNoOtherRelationsBesides.apply(this.leftPredicate, expectedExclusiveRelations) &&
           this.rightPredicate.concernedWithNoOtherRelationsBesides.apply(this.rightPredicate, expectedExclusiveRelations)
  }
  
  p.concernedWithAllOf = function() {
    var expectedRelations = _A.toArray(arguments)
  
    var self = this
    var remainingRelations = _.reject(expectedRelations, function(relation){
      return self.leftPredicate.concernedWithAllOf(relation) || self.rightPredicate.concernedWithAllOf(relation)
    })

    return _.isEmpty(remainingRelations)
  }
      
  p.isSame = function(other) {
    return other.constructor == F && 
           this.leftPredicate.isSame(other.leftPredicate) &&
           this.rightPredicate.isSame(other.rightPredicate)
  }
  
  p.isEquivalent = function(other) {
    return this.isSame(other) ||
             other.constructor == F && 
             this.leftPredicate.isEquivalent(other.rightPredicate) &&
             this.rightPredicate.isEquivalent(other.leftPredicate)
  }
  
  p.inspect = function() { return "and(" + this.leftPredicate.inspect() + "," + 
                                           this.rightPredicate.inspect() + ")" }
  
  return F
}()

knit.createBuilderFunction.dslLocals.conjunction = function(leftPredicate, rightPredicate) {
  return new knit.algebra.predicate.Conjunction(leftPredicate, rightPredicate)
}

knit.createBuilderFunction.dslLocals.and = knit.createBuilderFunction.dslLocals.conjunction
