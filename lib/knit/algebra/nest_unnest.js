require("knit/core")

module.exports.Unnest = (function(){

  var C = function(relation, nestedAttribute) {
            this.relation = relation
            this.nestedAttribute = nestedAttribute
          },
      p = C.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.defaultCompiler = function(){ return this.relation.defaultCompiler() }

  p.attributes = function(){ 
    var nestedAttributeIndex = this.relation.attributes().indexOf(this.nestedAttribute)
    return this.relation.attributes().splice(this.nestedAttribute.nestedRelation().attributes(), nestedAttributeIndex, 1)
  }
  
  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == C && 
             this.relation.isSame(other.relation) &&
             this.nestedAttribute.isSame(other.nestedAttribute)
    }
  
  p.inspect = function(){return "unnest(" + this.relation.inspect() + "," + 
                                            this.nestedAttribute.inspect() + ")"}
  
  C.dslLocals = {unnest: function(relation, nestedAttribute) { 
    return new knit.algebra.Unnest(relation, nestedAttribute) 
  }}

  return C
})()


module.exports.Nest = (function(){

  var C = function(relation, nestedAttribute) {
            this.relation = relation
            this.nestedAttribute = nestedAttribute
            this.nestedAttribute.setSourceRelation(relation)
          },
      p = C.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.defaultCompiler = function(){ return this.relation.defaultCompiler() }
  
  p.attributes = function(){ 
    return this.relation.attributes().spliceInNestedAttribute(this.nestedAttribute)
  }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }
  
  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == C && 
             this.relation.isSame(other.relation) &&
             this.nestedAttribute.isSame(other.nestedAttribute)
    }
  
  p.inspect = function(){return "nest(" + this.relation.inspect() + "," + this.nestedAttribute.inspect() + ")"}
  
  C.dslLocals = {nest: function(relation, nestedAttribute) {
    return new knit.algebra.Nest(relation, nestedAttribute)
  }}
  
  return C
})()