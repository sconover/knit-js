require("knit/core")

knit.mixin.ReferenceEnvironment = function(target) {
  target.relation = function(relationName) {
    return new knit.RelationReference(relationName)
  }
}

knit.RelationReference = function(){
  var F = function(relationName) {
    this._relationName = relationName
  }
  
  F.prototype.perform = function(bindings) {
    return bindings[this._relationName]
  }
  
  F.prototype.isSame = function(other) {
    return other.constructor == F &&
           this._relationName == other._relationName
  }
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.inspect = function(){return this._relationName}
  
  return F
}()