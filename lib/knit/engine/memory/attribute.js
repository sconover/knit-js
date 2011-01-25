knit.engine.Memory.Attribute = function(){

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

knit.engine.Memory.NestedAttribute = function(){

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
           this.nestedRelation().id() == other.nestedRelation().id()
  }
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.inspect = function() {
    return this.name() + ":" + this.nestedRelation().inspect()
  }
  
  return F
}()
