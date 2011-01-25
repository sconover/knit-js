require("knit/core")

knit.algebra.Order = function(){
  
  var F = function(relation, orderAttribute, direction) {
    this.relation = relation
    this.orderAttribute = orderAttribute
    this.direction = direction
  }; var p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.perform = function() {
    return this.relation.perform().performOrder(this.orderAttribute, this.direction)
  }

  p.attributes = function(){ return this.relation.attributes() }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }
  
  p.isSame = p.isEquivalent = function(other) {
    return other.constructor == F && 
           this.relation.isSame(other.relation) &&
           this.orderAttribute.isSame(other.orderAttribute) &&
           this.direction == other.direction
  }
  
  p.inspect = function(){return "order." + this.direction + 
                                  "(" + this.relation.inspect() + "," + 
                                        this.orderAttribute.inspect() + ")"}
  
  F.ASC = "asc"
  F.DESC = "desc"
  
  return F
}()

knit.createBuilderFunction.dslLocals.order = {
  asc: function(relation, orderAttribute) { return new knit.algebra.Order(relation, orderAttribute, knit.algebra.Order.ASC) },
  desc: function(relation, orderAttribute) { return new knit.algebra.Order(relation, orderAttribute, knit.algebra.Order.DESC) }
}


