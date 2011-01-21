require("knit/core")

knit.algebra.Unnest = function(){

  var F = function(relation, nestedAttribute) {
    this._attributes = relation.attributes()
    this.relation = relation
    this.nestedAttribute = nestedAttribute
  }
  
  knit.mixin.RowsAndObjects(F.prototype)
  
  F.prototype.apply = function() {
    return this.relation.apply().applyUnnest(this.nestedAttribute)
  }  

  F.prototype.attributes = function(){ return this._attributes }
  
  F.prototype.isSame = function(other) {
    return other.constructor == F && 
           this.relation.isSame(other.relation) &&
           this.nestedAttribute.isSame(other.nestedAttribute)
  }
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.inspect = function(){return "unnest(" + this.relation.inspect() + "," + this.nestedAttribute.inspect() + ")"}
  
  return F
}()

knit.dslLocals.unnest = function(relation, nestedAttribute) { 
  return new knit.algebra.Unnest(relation, nestedAttribute) 
}

knit.algebra.Nest = function(){

  var F = function(relation, nestedAttributeNameAndAttributesToNest) {
    this.relation = relation

    var nestedAttributeName = _.keys(nestedAttributeNameAndAttributesToNest)[0]
    var attributesToNest = _.values(nestedAttributeNameAndAttributesToNest)[0]
  
    this.nestedAttribute = this.relation.newNestedAttribute(nestedAttributeName, attributesToNest)
  
    this._attributes = [].concat(relation.attributes())
    var self = this
    var attributePositions = _.map(attributesToNest, function(attribute){return _.indexOf(self._attributes, attribute)})
    attributePositions.sort()
    var firstAttributePosition = attributePositions.shift()
    this._attributes.splice(firstAttributePosition,1,this.nestedAttribute)
  
    attributePositions.reverse()
    _.each(attributePositions, function(pos){self._attributes.splice(pos,1)})
  }
  
  knit.mixin.RowsAndObjects(F.prototype)
  
  F.prototype.apply = function() {
    //impose order for now
    var relation = this.relation
    var forceOrderOnTheseAttributes = _.without(this.attributes(), this.nestedAttribute)
    while(forceOrderOnTheseAttributes.length > 0) {
      var orderByAttr = forceOrderOnTheseAttributes.shift()
      relation = new knit.algebra.Order(relation, orderByAttr, knit.algebra.Order.ASC)
    }
    
    return relation.apply().applyNest(this.nestedAttribute, this.attributes())
  }
  
  F.prototype.attributes = function(){ return this._attributes }
  
  F.prototype.isSame = function(other) {
    return other instanceof knit.algebra.Nest && 
           this.relation.isSame(other.relation) &&
           this.nestedAttribute.isSame(other.nestedAttribute)
  }
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.inspect = function(){return "nest(" + this.relation.inspect() + "," + this.nestedAttribute.inspect() + ")"}

  return F
}()

knit.dslLocals.nest = function(relation, nestedAttributeNameAndAttributesToNest) {
  return new knit.algebra.Nest(relation, nestedAttributeNameAndAttributesToNest)
}

