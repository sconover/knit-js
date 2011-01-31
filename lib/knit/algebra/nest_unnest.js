require("knit/core")

knit.algebra.Unnest = function(){

  var F = function(relation, nestedAttribute) {
    this.relation = relation
    this.nestedAttribute = nestedAttribute
  }; var p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.perform = function() {
    return this.relation.perform().performUnnest(this.nestedAttribute)
  }  

  p.attributes = function(){ return this.relation.attributes() }
  
  p.isSame = p.isEquivalent = function(other) {
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
  }; var p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.perform = function() {
    //impose order for now
    var relation = this.relation
    
    var forceOrderOnTheseAttributes = _.without(this.attributes().toArray(), this.nestedAttribute)
    while(forceOrderOnTheseAttributes.length > 0) {
      var orderByAttr = forceOrderOnTheseAttributes.shift()
      relation = new knit.algebra.Order(relation, orderByAttr, knit.algebra.Order.ASC)
    }
    return relation.perform().performNest(this.nestedAttribute, this.attributes())
  }
  
  p.attributes = function(){ 
    var result = this.relation.attributes().shallowCopy()
    var self = this
    var attributePositions = _.map(this.nestedAttribute.nestedRelation().attributes(), function(attribute){
      return knit.indexOfSame(result, attribute)
    })
    attributePositions.sort()
    var firstAttributePosition = attributePositions.shift()
    result.splice(firstAttributePosition,1,this.nestedAttribute)
  
    attributePositions.reverse()
    _.each(attributePositions, function(pos){result.splice(pos,1)})
    return result
  }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }
  
  p.isSame = p.isEquivalent = function(other) {
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

