require("knit/core")
require("knit/attributes")

TestRelation = function() {
  var _A = CollectionFunctions.Array.functions,
      _ = knit._util
  
  var _id = 0
  
  var F = function(attributeNames) {
    _id += 1
    this._id = "test_" + _id
    var self = this
    
    if (attributeNames.constructor == knit.Attributes) {
      this._attributes = attributeNames
    } else {
      this._attributes = new knit.Attributes(
        _A.map(attributeNames, function(attr){
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
      )
    }
    
  }; var p = F.prototype

  p.id = function(){ return this._id }
  p.attributes = function(){ return this._attributes }
  
  p.attr = function(attributeName) { return this.attributes().get(attributeName) }
  p.isSame = function(other) { return other.id && this.id() == other.id() }
  
  p.isEquivalent = function(other) {
    return knit.quacksLike(other, knit.signature.relation) &&
           this.attributes().isSame(other.attributes())
  }
  
  p.split = p.merge = function(){return this}
  
  p.newNestedAttribute = function(attributeName, attributesToNest) {
    var nestedRelation = new TestRelation([]) 
    nestedRelation._attributes = attributesToNest
    return new TestNestedAttribute(attributeName, nestedRelation, this)
  }
  
  p.inspect = function() { return "r[" + this.attributes().inspect() + "]" }
  
  return F
}()

TestAttribute = function() {
  var F = function(name, sourceRelation) {
    this._name = name
    this._sourceRelation = sourceRelation
  }; var p = F.prototype

  p.name = function() { return this._name }
  p.sourceRelation = function() { return this._sourceRelation }
  p.isSame = p.isEquivalent = function(other) {
    return knit.quacksLike(other, knit.signature.attribute) &&
           this.name() == other.name() &&
           this.sourceRelation().id() == other.sourceRelation().id()
  }
  
  p.inspect = function() { return this.name() }
  
  return F
}()

TestNestedAttribute = function() {
  var F = function(name, nestedRelation, sourceRelation) {
    this._name = name
    this._nestedRelation = nestedRelation
    this._sourceRelation = sourceRelation
  }; var p = F.prototype
  
  p.name = function() { return this._name }
  p.sourceRelation = function() { return this._sourceRelation }
  p.nestedRelation = function() { return this._nestedRelation }
  p.isSame = p.isEquivalent = function(other) {
    return knit.quacksLike(other, knit.signature.nestedAttribute) &&
           this.name() == other.name() &&
           this.sourceRelation().id() == other.sourceRelation().id() &&
           this.sourceRelation().id() == other.sourceRelation().id()
  }

  p.inspect = function() { return this.name() + ":" + this.nestedRelation().inspect() }
  
  return F
}()
