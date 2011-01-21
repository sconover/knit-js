require("knit/core")

;(function(){
  
  var F = knit.algebra.Order = function(relation, orderAttribute, direction) {
    this._attributes = relation.attributes()
    this.relation = relation
    this.orderAttribute = orderAttribute
    this.direction = direction
  
    this.newNestedAttribute = this.relation.newNestedAttribute
  }

  F.prototype.attributes = function(){ return this._attributes }
  
  F.prototype.isSame = function(other) {
    return other instanceof knit.algebra.Order && 
           this.relation.isSame(other.relation) &&
           this.orderAttribute.isSame(other.orderAttribute) &&
           this.direction == other.direction
  }
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.inspect = function(){return "order." + this.direction + "(" + this.relation.inspect() + "," + this.orderAttribute.inspect() + ")"}
  
  F.ASC = "asc"
  F.DESC = "desc"

  knit.dslLocals.order = {
    asc: function(relation, orderAttribute) { return new F(relation, orderAttribute, F.ASC) },
    desc: function(relation, orderAttribute) { return new F(relation, orderAttribute, F.DESC) }
  }

})()

