knit.engine.Memory.Attribute = function(){

  var F = function(name, sourceRelation) {
    this._name = name
    this._sourceRelation = sourceRelation
  }; var p = F.prototype

  p.name = function() { return this._name }
  p.sourceRelation = function() { return this._sourceRelation }
  p.isSame = function(other) {
    return knit.quacksLike(other, knit.signature.attribute) &&
           this.name() == other.name() &&
           this.sourceRelation().id() == other.sourceRelation().id()
  }
  p.isEquivalent = p.isSame
  
  p.inspect = function() {
    return this.name()
  }
  
  return F
}()

knit.engine.Memory.NestedAttribute = function(){

  var F = function(name, nestedRelation, sourceRelation) {
    this._name = name
    this._nestedRelation = nestedRelation
    this._sourceRelation = sourceRelation
  }; var p = F.prototype
  
  p.name = function() { return this._name }
  p.sourceRelation = function() { return this._sourceRelation }
  p.nestedRelation = function() { return this._nestedRelation }
  p.isSame = function(other) {
    return knit.quacksLike(other, knit.signature.nestedAttribute) &&
           this.name() == other.name() &&
           this.nestedRelation().id() == other.nestedRelation().id()
  }
  p.isEquivalent = p.isSame
  
  p.inspect = function() {
    return this.name() + ":" + this.nestedRelation().inspect()
  }
  
  return F
}()
