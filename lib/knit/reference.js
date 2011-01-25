require("knit/core")

knit.RelationReference = function(){
  var F = function(relationName) {
    this._relation = new knit.UnresolvedRelationReference(relationName)
  }
  
  F.prototype.resolve = function(bindings) { 
    if (this._relation.resolve) this._relation = this._relation.resolve(bindings) 
    return this
  }
  
  _.each(["id", "attributes", "attr", "inspect", "merge", "split", "newNestedAttribute", "perform"], function(methodNameToDelegate) {
    F.prototype[methodNameToDelegate] = function() { 
      return this._relation[methodNameToDelegate].apply(this._relation, arguments) 
    }
  })
  
  F.prototype.isSame = function(other) { 
    return this._relation.isSame(other) || !!(other._relation && this._relation.isSame(other._relation))
  }
  F.prototype.isEquivalent = F.prototype.isSame
  
  return F
}()

knit.UnresolvedRelationReference = function(){
  var _id = 0
  
  var F = function(relationName) {
    this._relationName = relationName
    _id += 1
    this._id = "unresolvedRelation_" + _id
  }
  
  F.prototype.id = function(bindings) { return this._id }
  
  F.prototype.resolve = function(bindings) { return bindings[this._relationName] }

  _.each(["attributes", "attr", "merge", "split", "newNestedAttribute", "perform"], function(methodNameToDelegate) {
    F.prototype[methodNameToDelegate] = function() { 
      throw(methodNameToDelegate + " not available until after resolve (and refs are bound to real relations)")
    }
  })
  
  F.prototype.isSame = function(other) {
    return other.constructor == F &&
           this._relationName == other._relationName
  }
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.inspect = function(){return "*" + this._relationName }
  
  return F
}()

knit.NullRelation = function(){
  var F = function() {}
  F.prototype.resolve = function(bindings) { return this }
  F.prototype.id = function() { return "nullRelation_id" }
  F.prototype.attributes = function() { return [] }
  F.prototype.attr = function() { throw("Null Relation has no attributes") }
  F.prototype.inspect = function() { return "nullRelation" }
  F.prototype.merge = function() { return this }
  F.prototype.split = function() { return this }
  F.prototype.newNestedAttribute = function() { throw("It doesn't make sense for Null Relation to create attributes") }
  F.prototype.perform = function() { return this }
  F.prototype.isSame = function(other) { return this === other }
  F.prototype.isEquivalent = F.prototype.isSame
  return new F()  
}()

knit.AttributeReference = function(){
  var F = function(relationRef, attributeName) {
    this._attribute = new knit.UnresolvedAttributeReference(relationRef, attributeName)
  }
  
  F.prototype.resolve = function(bindings) { 
    if (this._attribute.resolve) this._attribute = this._attribute.resolve(bindings) 
    return this
  }
  
  F.prototype.name = function() { return this._attribute.name() }
  F.prototype.sourceRelation = function() { return this._attribute.sourceRelation() }

  F.prototype.isSame = function(other) { 
    return this._attribute.isSame(other)
  }
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.inspect = function(){return this._attribute.inspect()}
  
  return F
}()

knit.UnresolvedAttributeReference = function(){
  var F = function(relationRef, attributeName) {
    this._relationRef = relationRef
    this._attributeName = attributeName
  }
  
  F.prototype.resolve = function(bindings) {
    return this._relationRef.resolve(bindings).attr(this._attributeName)
  }

  F.prototype.name = function() { return this._attributeName }
  F.prototype.sourceRelation = function() { return this._relationRef }
  
  F.prototype.isSame = function(other) {
    return knit.quacksLike(other, knit.signature.attribute) &&
           this.sourceRelation().isSame(other.sourceRelation()) &&
           this.name() == other.name()
  }
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.inspect = function(){return "*" + this._attributeName}
  
  return F
}()

knit.NestedAttributeReference = function(){
  var F = function(attributeName, nestedAttributes) {
    this._attribute = new knit.UnresolvedNestedAttributeReference(attributeName, nestedAttributes)
  }
  
  F.prototype.resolve = function(bindings) { 
    if (this._attribute.resolve)  this._attribute = this._attribute.resolve(bindings) 
    return this
  }
  
  F.prototype.name = function() { return this._attribute.name() }
  F.prototype.setSourceRelation = function(sourceRelation) { return this._attribute.setSourceRelation(sourceRelation) }
  F.prototype.sourceRelation = function() { return this._attribute.sourceRelation() }
  F.prototype.nestedRelation = function() { return this._attribute.nestedRelation() }
  
  F.prototype.isSame = function(other) {
    return knit.quacksLike(other, knit.signature.attribute) &&
           this._attribute.isSame(other)
  }
  
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.inspect = function(){return this._attribute.inspect()}
  
  return F
}()

knit.UnresolvedNestedAttributeReference = function(){
  var F = function(attributeName, nestedAttributes) {
    this._attributeName = attributeName
    this._nestedAttributes = nestedAttributes
    this._sourceRelation = knit.NullRelation
  }

  F.prototype.resolve = function(bindings) { 
    _.each(this._nestedAttributes, function(nestedAttribute){nestedAttribute.resolve(bindings)})
    if (this.sourceRelation().resolve) this.sourceRelation().resolve(bindings)
    return this.sourceRelation().newNestedAttribute(this._attributeName, this._nestedAttributes)
  }
  
  F.prototype.name = function() { return this._attributeName }
  F.prototype.sourceRelation = function() { return this._sourceRelation }
  F.prototype.setSourceRelation = function(sourceRelation) { this._sourceRelation = sourceRelation; return this }
  F.prototype.nestedRelation = function() { throw("nestedRelation is not available until after resolve") }
  
  F.prototype.isSame = function(other) {
    return knit.quacksLike(other, knit.signature.attribute) &&
           this.sourceRelation().isSame(other.sourceRelation()) &&
           this.name() == other.name()
  }
  
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.inspect = function(){return "*" + this._attributeName}
  
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
  
  function regularAttr(relationNameDotAttributeName) {
    var key = relationNameDotAttributeName
    var parts = relationNameDotAttributeName.split(".")
    var relationRef = this.relation(parts[0])
    var attributeName = parts[1]
    var attributeRef = this._keyToRef[key] = this._keyToRef[key] || new knit.AttributeReference(relationRef, attributeName)
    return attributeRef
  }
  
  function nestedAttr(attributeName, nestedAttributeRefs) {
    var key = attributeName
    var attributeRef = this._keyToRef[key] = this._keyToRef[key] || new knit.NestedAttributeReference(attributeName, nestedAttributeRefs)
    return attributeRef
  }
  
  
  F.prototype.attr = function() {
    var args = _.toArray(arguments)
    
    if (args.length == 1) {
      var relationNameDotAttributeName = args[0]
      return _.bind(regularAttr, this)(relationNameDotAttributeName)
    } else if (args.length==2 && _.isArray(args[1]) ){
      var attributeName = args[0]
      var nestedAttributeRefs = args[1]
      return _.bind(nestedAttr, this)(attributeName, nestedAttributeRefs)
    } else {
      var self = this
      return _.map(args, function(relationNameDotAttributeName){return self.attr(relationNameDotAttributeName)})
    }
  }
  

  F.prototype.resolve = function(bindings) {
    var self = this
    
    var resolved = []
    _.each(_.keys(bindings), function(relationKey){
      
      self.relation(relationKey).resolve(bindings)
      resolved.push(relationKey)
      
      _.each(bindings[relationKey].attributes(), function(attribute){
        var attributeKey = relationKey + "." + attribute.name()
        self.attr(attributeKey).resolve(bindings)
        resolved.push(attributeKey)
      })
    })
    
    
    var stillToResolve = _.without.apply(null, [_.keys(this._keyToRef)].concat(resolved))
    _.each(stillToResolve, function(key){
      self._keyToRef[key].resolve(bindings)
    })
    
    return this
  }
  
  
  F.prototype.decorate = function(target, bindings) {
    target.relation = _.bind(this.relation, this)
    target.attr = _.bind(this.attr, this)
    var resolveF = _.bind(this.resolve, this)
    target.resolve = function(){resolveF(bindings())}
    return target
  }
  
  return F
}()