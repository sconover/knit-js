require("knit/core")

knit.RelationReference = function(){
  var F = function(relationName) {
    this._relation = new knit.UnresolvedRelationReference(relationName)
  }; var p = F.prototype
  
  p.resolve = function(bindings) { 
    if (this._relation.resolve) this._relation = this._relation.resolve(bindings) 
    return this
  }
  
  _.each(["id", "attributes", "attr", "inspect", "merge", "split", "newNestedAttribute", "perform"], function(methodNameToDelegate) {
    p[methodNameToDelegate] = function() { 
      return this._relation[methodNameToDelegate].apply(this._relation, arguments) 
    }
  })
  
  p.isSame = p.isEquivalent = function(other) { 
    return this._relation.isSame(other) || !!(other._relation && this._relation.isSame(other._relation))
  }
  
  return F
}()

knit.UnresolvedRelationReference = function(){
  var _id = 0
  
  var F = function(relationName) {
    this._relationName = relationName
    _id += 1
    this._id = "unresolvedRelation_" + _id
  }; var p = F.prototype
  
  p.id = function(bindings) { return this._id }
  p.resolve = function(bindings) { return bindings[this._relationName] }

  _.each(["attributes", "attr", "merge", "split", "newNestedAttribute", "perform"], function(methodNameToDelegate) {
    p[methodNameToDelegate] = function() { 
      throw(methodNameToDelegate + " not available until after resolve (and refs are bound to real relations)")
    }
  })
  
  p.isSame = p.isEquivalent = function(other) {
    return other.constructor == F &&
           this._relationName == other._relationName
  }
  
  p.inspect = function(){return "*" + this._relationName }
  
  return F
}()

knit.NullRelation = function(){
  var F = function() {}; var p = F.prototype
  p.resolve = function(bindings) { return this }
  p.id = function() { return "nullRelation_id" }
  p.attributes = function() { return [] }
  p.attr = function() { throw("Null Relation has no attributes") }
  p.inspect = function() { return "nullRelation" }
  p.merge = function() { return this }
  p.split = function() { return this }
  p.newNestedAttribute = function() { throw("It doesn't make sense for Null Relation to create attributes") }
  p.perform = function() { return this }
  p.isSame = p.isEquivalent = function(other) { return this === other }
  return new F()  
}()

knit.AttributeReference = function(){
  var F = function(relationRef, attributeName) {
    this._attribute = new knit.UnresolvedAttributeReference(relationRef, attributeName)
  }; var p = F.prototype
  
  p.resolve = function(bindings) { 
    if (this._attribute.resolve) this._attribute = this._attribute.resolve(bindings) 
    return this
  }
  
  p.name = function() { return this._attribute.name() }
  p.sourceRelation = function() { return this._attribute.sourceRelation() }

  p.isSame = p.isEquivalent = function(other) { 
    return this._attribute.isSame(other)
  }
  
  p.inspect = function(){return this._attribute.inspect()}
  
  return F
}()

knit.UnresolvedAttributeReference = function(){
  var F = function(relationRef, attributeName) {
    this._relationRef = relationRef
    this._attributeName = attributeName
  }; var p = F.prototype
  
  p.resolve = function(bindings) {
    return this._relationRef.resolve(bindings).attr(this._attributeName)
  }

  p.name = function() { return this._attributeName }
  p.sourceRelation = function() { return this._relationRef }
  
  p.isSame = p.isEquivalent = function(other) {
    return knit.quacksLike(other, knit.signature.attribute) &&
           this.sourceRelation().isSame(other.sourceRelation()) &&
           this.name() == other.name()
  }
  
  p.inspect = function(){return "*" + this._attributeName}
  
  return F
}()

knit.NestedAttributeReference = function(){
  
  var F = function(attributeName, nestedAttributes) {
    this._attribute = new knit.UnresolvedNestedAttributeReference(attributeName, nestedAttributes)
  }; var p = F.prototype
  
  p.resolve = function(bindings) { 
    if (this._attribute.resolve)  this._attribute = this._attribute.resolve(bindings) 
    return this
  }
  
  p.name = function() { return this._attribute.name() }
  p.setSourceRelation = function(sourceRelation) { return this._attribute.setSourceRelation(sourceRelation) }
  p.sourceRelation = function() { return this._attribute.sourceRelation() }
  p.nestedRelation = function() { return this._attribute.nestedRelation() }
  
  p.isSame = p.isEquivalent = function(other) {
    return knit.quacksLike(other, knit.signature.attribute) &&
           this._attribute.isSame(other)
  }
  
  p.inspect = function(){return this._attribute.inspect()}
  
  return F
}()

knit.UnresolvedNestedAttributeReference = function(){
  var F = function(attributeName, nestedAttributes) {
    this._attributeName = attributeName
    this._nestedAttributes = nestedAttributes
    this._sourceRelation = knit.NullRelation
  }; var p = F.prototype

  p.resolve = function(bindings) { 
    _.each(this._nestedAttributes, function(nestedAttribute){nestedAttribute.resolve(bindings)})
    return this.sourceRelation().newNestedAttribute(this._attributeName, this._nestedAttributes)
  }
  
  p.name = function() { return this._attributeName }
  p.sourceRelation = function() { return this._sourceRelation }
  p.setSourceRelation = function(sourceRelation) { this._sourceRelation = sourceRelation; return this }
  p.nestedRelation = function() { throw("nestedRelation is not available until after resolve") }
  
  p.isSame = p.isEquivalent = function(other) {
    return knit.quacksLike(other, knit.signature.attribute) &&
           this.sourceRelation().isSame(other.sourceRelation()) &&
           this.name() == other.name()
  }
  
  p.inspect = function(){return "*" + this._attributeName}
  
  return F
}()


knit.ReferenceEnvironment = function(){
  var F = function() {
    this._keyToRef = {}
  }; var p = F.prototype
  
  p.relation = function(relationName) {
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
  
  p.attr = function() {
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
  
  p.resolve = function(bindings) {
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
  
  p.decorate = function(target, bindings) {
    target.relation = _.bind(this.relation, this)
    target.attr = _.bind(this.attr, this)
    var resolveF = _.bind(this.resolve, this)
    target.resolve = function(){resolveF(bindings())}
    return target
  }
  
  return F
}()