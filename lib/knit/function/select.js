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
        return select(this.relation.relation, conjunction(this.criteria, this.relation.criteria))
      }, this)
    } else {
      return this
    }
  },
  
  isSame: function(other) {
    return other.constructor == knit.function.Select && 
           this.relation.isSame(other.relation) &&
           this.criteria.isSame(other.criteria)
  },
  
  isEquivalent: function(other) {
    return this.isSame(other) ||
             other.constructor == knit.function.Select && 
             this.relation.isEquivalent(other.relation) &&
             this.criteria.isEquivalent(other.criteria)
  }
})

knit.locals.select = function(relation, criteria) {
  return new knit.function.Select(relation, criteria)
}