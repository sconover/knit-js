require("knit/core")

knit.mixin.ReferenceEnvironment = function(target) {
  target.relation = function(relationName) {
    return new knit.RelationReference(relationName)
  }

  target.attr = function(relationNameToAttributeName) {
    var relationName = _.keys(relationNameToAttributeName)[0]
    var attributeName = _.values(relationNameToAttributeName)[0]
    return new knit.AttributeReference(relationName, attributeName)
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

knit.AttributeReference = function(){
  var F = function(relationName, attributeName) {
    this._relationRef = new knit.RelationReference(relationName)
    this._attributeName = attributeName
  }
  
  F.prototype.perform = function(bindings) {
    return this._relationRef.perform(bindings).attr(this._attributeName)
  }
  
  F.prototype.isSame = function(other) {
    return other.constructor == F &&
           this._relationRef.isSame(other._relationRef) &&
           this._attributeName == other._attributeName
  }
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.inspect = function(){return this._attributeName}
  
  return F
}()