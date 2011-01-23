knit.engine.Memory.Attribute = function(){

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

knit.engine.Memory.NestedAttribute = function(){

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
