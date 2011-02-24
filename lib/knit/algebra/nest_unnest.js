require("knit/core")

knit.algebra.Unnest = (function(){

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
  
  return C
})()

knit.createBuilderFunction.dslLocals.unnest = function(relation, nestedAttribute) { 
  return new knit.algebra.Unnest(relation, nestedAttribute) 
}

knit.algebra.Nest = (function(){

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

  return C
})()

knit.createBuilderFunction.dslLocals.nest = function(relation, nestedAttribute) {
  return new knit.algebra.Nest(relation, nestedAttribute)
}

