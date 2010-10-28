require("knit/core")
require("knit/function/predicate")

knit.function.Select = function(relation, criteria) {
  this.attributes = relation.attributes
  this.relation = relation
  this.criteria = criteria
}

_.extend(knit.function.Select.prototype, {
  merge: function() {
    if (this.relation.criteria) {
      return knit(function(){
        return select(this.relation.relation.merge(), conjunction(this.relation.criteria, this.criteria))
      }, this)
    } else {
      return this
    }
  },
  
  split: function() {
    if (this.criteria instanceof knit.function.predicate.Conjunction) {
      return knit(function(){
        return select(
          select(this.relation.split(), this.criteria.leftPredicate),
          this.criteria.rightPredicate
        )
      }, this)
    } else {
      return this
    }
  },
  
  push: function() {
    if (this.relation instanceof knit.function.Join) {
      var join = this.relation
      
      if (this.criteria.onlyConcernedWith(join.relationOne)) {
        join.relationOne = new knit.function.Select(join.relationOne, this.criteria)
        return join
      } else if (this.criteria.onlyConcernedWith(join.relationTwo)) {
        join.relationTwo = new knit.function.Select(join.relationTwo, this.criteria)
        return join
      } else {
        return this
      }
    } else {
      return this
    }
  },
  
  isSame: function(other) {
    return other instanceof knit.function.Select && 
           this.relation.isSame(other.relation) &&
           this.criteria.isSame(other.criteria)
  },
  
  isEquivalent: function(other) {
    if (other instanceof knit.function.Select) {
      var thisMerged = this.merge()
      var otherMerged = other.merge()
    
      return thisMerged.isSame(otherMerged) ||
               thisMerged.relation.isEquivalent(otherMerged.relation) &&
               thisMerged.criteria.isEquivalent(otherMerged.criteria)
    } else {
      return false
    }
  },
  
  inspect: function(){return "select(" + this.relation.inspect() + "," + this.criteria.inspect() + ")"}
})

knit.locals.select = function(relation, criteria) {
  return new knit.function.Select(relation, criteria)
}