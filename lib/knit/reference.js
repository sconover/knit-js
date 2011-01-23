require("knit/core")

knit.RelationReference = function(){
  var F = function(relationName) {
    this._relation = new knit.UnresolvedRelationReference(relationName)
  }
  
  F.prototype.resolve = function(bindings) { 
    this._relation = this._relation.resolve(bindings) 
    return this
  }
  
  F.prototype.attributes = function() { return this._relation.attributes() }
  F.prototype.attr = function() { return this._relation.attr.apply(this._relation, arguments) }
  
  F.prototype.isSame = function(other) { 
    return this._relation.isSame(other) || !!(other._relation && this._relation.isSame(other._relation))
  }
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.inspect = function(){return this._relation.inspect()}
  
  return F
}()

knit.UnresolvedRelationReference = function(){
  var F = function(relationName) {
    this._relationName = relationName
  }
  
  F.prototype.resolve = function(bindings) { return bindings[this._relationName] }

  F.prototype.attributes = function() {
    throw("relation attributes are not available until after relation resolution / binding")
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
    this._attribute = new knit.UnresolvedAttributeReference(relationName, attributeName)
  }
  
  F.prototype.resolve = function(bindings) { 
    this._attribute = this._attribute.resolve(bindings) 
    return this
  }
  
  F.prototype.name = function(bindings) { return this._attribute.name() }
  
  F.prototype.isSame = function(other) { 
    return this._attribute.isSame(other) || !!(other._attribute && this._attribute.isSame(other._attribute))
  }
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.inspect = function(){return this._attribute.inspect()}
  
  return F
}()

knit.UnresolvedAttributeReference = function(){
  var F = function(relationName, attributeName) {
    this._relationRef = new knit.RelationReference(relationName)
    this._attributeName = attributeName
  }
  
  F.prototype.resolve = function(bindings) {
    return this._relationRef.resolve(bindings).attr(this._attributeName)
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

knit.ReferenceEnvironment = function(){
  var F = function() {
    this._keyToRef = {}
  }
  
  F.prototype.relation = function(relationName) {
    var relationRef = this._keyToRef[relationName] = this._keyToRef[relationName] || new knit.RelationReference(relationName)
    return relationRef
  }
  
  F.prototype.attr = function(relationNameToAttributeName) {
    var relationName = _.keys(relationNameToAttributeName)[0]
    var attributeName = _.values(relationNameToAttributeName)[0]
    var key = relationName + ":" + attributeName
    var attributeRef = this._keyToRef[key] = this._keyToRef[key] || new knit.AttributeReference(relationName, attributeName)
    return attributeRef
  }
  
  F.prototype.decorate = function(target) {
    target.relation = _.bind(this.relation, this)
    target.attr = _.bind(this.attr, this)
    return target
  }
  
  F.prototype.resolve = function(bindings) {
    var allRefs = _.values(this._keyToRef)
    _.each(allRefs, function(ref){ref.resolve(bindings)})
    return this
  }
  
  return F
}()