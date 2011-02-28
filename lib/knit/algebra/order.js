require("knit/core")

module.exports.Order = (function(){
  
  var C = function(relation, orderAttribute, direction) {
            this.relation = relation
            this.orderAttribute = orderAttribute
            this.direction = direction
          },
      p = C.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.defaultCompiler = function(){ return this.relation.defaultCompiler() }

  p.attributes = function(){ return this.relation.attributes() }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }
  
  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == C && 
             this.relation.isSame(other.relation) &&
             this.orderAttribute.isSame(other.orderAttribute) &&
             this.direction == other.direction
    }
  
  p.inspect = function(){return "order." + this.direction + 
                                  "(" + this.relation.inspect() + "," + 
                                        this.orderAttribute.inspect() + ")"}
  
  C.ASC = "asc"
  C.DESC = "desc"
  
  C.dslLocals = {order: {
    asc: function(relation, orderAttribute) { return new C(relation, orderAttribute, C.ASC) },
    desc: function(relation, orderAttribute) { return new C(relation, orderAttribute, C.DESC) }
  }}
    
  return C
})()

