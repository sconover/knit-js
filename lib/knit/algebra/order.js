require("knit/core")

knit.algebra.Order = function(relation, orderAttribute, direction) {
  this._attributes = relation.attributes()
  this.relation = relation
  this.orderAttribute = orderAttribute
  this.direction = direction
  
  this.newNestedAttribute = this.relation.newNestedAttribute
}

_.extend(knit.algebra.Order.prototype, {
  attributes: function(){ return this._attributes },
  
  isSame: function(other) {
    return other instanceof knit.algebra.Order && 
           this.relation.isSame(other.relation) &&
           this.orderAttribute.isSame(other.orderAttribute) &&
           this.direction == other.direction
  },
  
  inspect: function(){return "order." + this.direction + "(" + this.relation.inspect() + "," + this.orderAttribute.inspect() + ")"}
})

knit.algebra.Order.prototype.isEquivalent = knit.algebra.Order.prototype.isSame

knit.algebra.Order.ASC = "asc"
knit.algebra.Order.DESC = "desc"

knit.dslLocals.order = {
  asc: function(relation, orderAttribute) {
    return new knit.algebra.Order(relation, orderAttribute, knit.algebra.Order.ASC)
  },

  desc: function(relation, orderAttribute) {
    return new knit.algebra.Order(relation, orderAttribute, knit.algebra.Order.DESC)
  }
}