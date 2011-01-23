require("knit/core")

knit.TestRelationFunction = function() {
  
  var F = function(attributeNames) {
    var self = this
    this._attributes = _.map(attributeNames, function(attr){
      if (attr.name) {
        return attr
      } else if (typeof attr == "string") {
        var attributeName = attr
        return new knit.TestAttribute(attributeName, self)
      } else {
        var attributeName = _.keys(attr)[0]
        var nestedRelation = _.values(attr)[0]
        return new knit.TestNestedAttribute(attributeName, nestedRelation, self)
      }
    })
    
  }

  F.prototype.attributes = function(){ return this._attributes }
  
  F.prototype.attr = function(attributeName) {
    return _.detect(this.attributes(), function(attr){return attr.name() == attributeName})
  }
  
  F.prototype.isSame = function(other) {
    return other.constructor == F &&
           this.attributes().length == other.attributes().length &&
           _.detect(this.attributes(), function(attr, i){return !attr.isSame(other.attributes()[i])}) == null
  }
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.split = function(){return this}
  F.prototype.merge = function(){return this}
  
  F.prototype.newNestedAttribute = function(attributeName, attributesToNest) {
    var nestedRelation = new knit.TestRelationFunction([]) 
    nestedRelation._attributes = attributesToNest
    return new knit.TestNestedAttribute(attributeName, nestedRelation, this)
  }
  
  F.prototype.inspect = function() {
    return "r[" + _.map(this.attributes(), function(attr){return attr.inspect()}).join(",") + "]" 
  }
  
  return F
}()

knit.dslLocals.testRelation = function(attrDefs) {
  return new knit.TestRelationFunction(attrDefs)
}


knit.TestAttribute = function() {
  var F = function(name, sourceRelation) {
    this._name = name
    this._sourceRelation = sourceRelation
  }

  F.prototype.name = function() { return this._name }
  F.prototype.isSame = function(other) {
    return this.name() == other.name() &&
           other.nestedRelation === undefined &&
           this._sourceRelation === other._sourceRelation
  }
  
  F.prototype.inspect = function() {
    return this.name()
  }
  
  return F
}()

knit.TestNestedAttribute = function() {
  var F = function(name, nestedRelation, sourceRelation) {
    this._name = name
    this.nestedRelation = nestedRelation
    this._sourceRelation = sourceRelation
  }
  
  F.prototype.name = function() { return this._name }
  F.prototype.isSame = function(other) {
    return this.name() == other.name() &&
           other.nestedRelation != undefined &&
           this.nestedRelation.isSame(other.nestedRelation) &&
           this._sourceRelation === other._sourceRelation
  }
  
  F.prototype.inspect = function() {
    return this.name() + ":" + this.nestedRelation.inspect()
  }
  
  return F
}()
