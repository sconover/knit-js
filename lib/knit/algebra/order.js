require("knit/core")

knit.algebra.Order = function(){
  
  var F = function(relation, orderAttribute, direction) {
    this._attributes = relation.attributes()
    this.relation = relation
    this.orderAttribute = orderAttribute
    this.direction = direction
  
    this.newNestedAttribute = this.relation.newNestedAttribute
  }
  
  knit.mixin.RowsAndObjects(F.prototype)
  
  F.prototype.apply = function() {
    return this.relation.apply().applyOrder(this.orderAttribute, this.direction)
  }

  F.prototype.attributes = function(){ return this._attributes }
  
  F.prototype.isSame = function(other) {
    return other.constructor == F && 
           this.relation.isSame(other.relation) &&
           this.orderAttribute.isSame(other.orderAttribute) &&
           this.direction == other.direction
  }
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.inspect = function(){return "order." + this.direction + "(" + this.relation.inspect() + "," + this.orderAttribute.inspect() + ")"}
  
  F.ASC = "asc"
  F.DESC = "desc"
  
  return F
}()

knit.dslLocals.order = {
  asc: function(relation, orderAttribute) { return new knit.algebra.Order(relation, orderAttribute, knit.algebra.Order.ASC) },
  desc: function(relation, orderAttribute) { return new knit.algebra.Order(relation, orderAttribute, knit.algebra.Order.DESC) }
}


