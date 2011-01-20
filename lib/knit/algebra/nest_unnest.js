require("knit/core")

knit.algebra.Unnest = function(relation, nestedAttribute) {
  this._attributes = relation.attributes()
  this.relation = relation
  this.nestedAttribute = nestedAttribute
}

_.extend(knit.algebra.Unnest.prototype, {
  attributes: function(){ return this._attributes },
  
  isSame: function(other) {
    return other instanceof knit.algebra.Unnest && 
           this.relation.isSame(other.relation) &&
           this.nestedAttribute.isSame(other.nestedAttribute)
  },
  
  inspect: function(){return "unnest(" + this.relation.inspect() + "," + this.nestedAttribute.inspect() + ")"}
})

knit.algebra.Unnest.prototype.isEquivalent = knit.algebra.Unnest.prototype.isSame

knit.dslLocals.unnest = function(relation, nestedAttribute) {
  return new knit.algebra.Unnest(relation, nestedAttribute)
}