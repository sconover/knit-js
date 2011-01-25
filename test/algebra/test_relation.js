require("knit/core")

TestRelation = function() {
  var _id = 0
  
  var F = function(attributeNames) {
    _id += 1
    this._id = "test_" + _id
    var self = this
    this._attributes = _.map(attributeNames, function(attr){
      if (attr.name) {
        return attr
      } else if (typeof attr == "string") {
        var attributeName = attr
        return new TestAttribute(attributeName, self)
      } else {
        var attributeName = _.keys(attr)[0]
        var nestedRelation = _.values(attr)[0]
        return new TestNestedAttribute(attributeName, nestedRelation, self)
      }
    })
    
  }

  F.prototype.id = function(){ return this._id }
  F.prototype.attributes = function(){ return this._attributes }
  
  F.prototype.attr = function(attributeName) {
    return _.detect(this.attributes(), function(attr){return attr.name() == attributeName})
  }
  
  F.prototype.isSame = function(other) {
    return other.id && this.id() == other.id()
  }
  
  F.prototype.isEquivalent = function(other) {
    return knit.quacksLike(other, knit.signature.relation) &&
           this.attributes().length == other.attributes().length &&
           _.detect(this.attributes(), function(attr, i){return !attr.isSame(other.attributes()[i])}) == null
  }
  
  F.prototype.split = function(){return this}
  F.prototype.merge = function(){return this}
  
  F.prototype.newNestedAttribute = function(attributeName, attributesToNest) {
    var nestedRelation = new TestRelation([]) 
    nestedRelation._attributes = attributesToNest
    return new TestNestedAttribute(attributeName, nestedRelation, this)
  }
  
  F.prototype.inspect = function() {
    return "r[" + _.map(this.attributes(), function(attr){return attr.inspect()}).join(",") + "]" 
  }
  
  return F
}()

TestAttribute = function() {
  var F = function(name, sourceRelation) {
    this._name = name
    this._sourceRelation = sourceRelation
  }

  F.prototype.name = function() { return this._name }
  F.prototype.sourceRelation = function() { return this._sourceRelation }
  F.prototype.isSame = function(other) {
    return knit.quacksLike(other, knit.signature.attribute) &&
           this.name() == other.name() &&
           this.sourceRelation().id() == other.sourceRelation().id()
  }
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.inspect = function() {
    return this.name()
  }
  
  return F
}()

TestNestedAttribute = function() {
  var F = function(name, nestedRelation, sourceRelation) {
    this._name = name
    this._nestedRelation = nestedRelation
    this._sourceRelation = sourceRelation
  }
  
  F.prototype.name = function() { return this._name }
  F.prototype.sourceRelation = function() { return this._sourceRelation }
  F.prototype.nestedRelation = function() { return this._nestedRelation }
  F.prototype.isSame = function(other) {
    return knit.quacksLike(other, knit.signature.nestedAttribute) &&
           this.name() == other.name() &&
           this.sourceRelation().id() == other.sourceRelation().id() &&
           this.sourceRelation().id() == other.sourceRelation().id()
  }
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.inspect = function() {
    return this.name() + ":" + this.nestedRelation().inspect()
  }
  
  return F
}()
