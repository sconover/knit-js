require("knit/core")

knit.algebra.Unnest = function(){

  var F = function(relation, nestedAttribute) {
            this.relation = relation
            this.nestedAttribute = nestedAttribute
          },
      p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.defaultCompiler = function(){ return this.relation.defaultCompiler() }
  p.perform = function() {
    return this.relation.perform().performUnnest(this.nestedAttribute)
  }  

  p.attributes = function(){ 
    // function flattenNestedAttribute(relation, nestedAttribute) {
    //   var nestedRelationAttributes = _.values(nestedAttribute)[0],
    //       nestedAttributeIndex = _N.indexOf(relation.attributes, nestedAttribute)
    //   return _N.splice(relation.attributes, nestedRelationAttributes, nestedAttributeIndex, 1)
    // }
    // 
    var nestedAttributeIndex = this.relation.attributes().indexOf(this.nestedAttribute)
    return this.relation.attributes().splice(this.nestedAttribute.nestedRelation().attributes(), nestedAttributeIndex, 1)
  }
  
  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == F && 
             this.relation.isSame(other.relation) &&
             this.nestedAttribute.isSame(other.nestedAttribute)
    }
  
  p.inspect = function(){return "unnest(" + this.relation.inspect() + "," + 
                                            this.nestedAttribute.inspect() + ")"}
  
  return F
}()

knit.createBuilderFunction.dslLocals.unnest = function(relation, nestedAttribute) { 
  return new knit.algebra.Unnest(relation, nestedAttribute) 
}

knit.algebra.Nest = function(){

  var F = function(relation, nestedAttribute) {
            this.relation = relation
            this.nestedAttribute = nestedAttribute
            this.nestedAttribute.setSourceRelation(relation)
          },
      p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.defaultCompiler = function(){ return this.relation.defaultCompiler() }
  p.perform = function() {
    //impose order for now
    var relation = this.attributes().without(this.nestedAttribute).wrapWithOrderBy(this.relation, knit.algebra.Order.ASC)
    return relation.perform().performNest(this.nestedAttribute, this.attributes())
  }
  
  p.attributes = function(){ 
    return this.relation.attributes().spliceInNestedAttribute(this.nestedAttribute)
  }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }
  
  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == F && 
             this.relation.isSame(other.relation) &&
             this.nestedAttribute.isSame(other.nestedAttribute)
    }
  
  p.inspect = function(){return "nest(" + this.relation.inspect() + "," + this.nestedAttribute.inspect() + ")"}

  return F
}()

knit.createBuilderFunction.dslLocals.nest = function(relation, nestedAttribute) {
  return new knit.algebra.Nest(relation, nestedAttribute)
}

