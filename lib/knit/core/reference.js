knit.RelationReference = function(){
  var _ = knit._util,
      C = function(relationName) {
            this._relation = new knit.UnresolvedRelationReference(relationName)
          },
      p = C.prototype

  p.resolve = function(bindings) { 
    if (this._relation.resolve) this._relation = this._relation.resolve(bindings) 
    return this
  }

  _.each(["id", "attr", "name"], function(methodNameToDelegate) {
    p[methodNameToDelegate] = function() { 
      return this._relation[methodNameToDelegate].apply(this._relation, arguments) 
    }
  })
  
  _.delegate(p, 
             _.extend({}, knit.signature.compiledRelation, knit.signature.relationExpression), 
             function(){return this._relation})
  
  p.isSame = 
    p.isEquivalent = function(other) { 
      return this._relation.isSame(other) || !!(other._relation && this._relation.isSame(other._relation))
    }

  return C
}()

knit.UnresolvedRelationReference = function(){
  var _ = knit._util,
      _id = 0,
      C = function(relationName) {
            this._relationName = relationName
            _id += 1
            this._id = "unresolvedRelation_" + _id
          },
      p = C.prototype

  p.id = function(bindings) { return this._id }
  p.resolve = function(bindings) { return bindings[this._relationName] }
  
  _.each(["attributes", "attr", "merge", "split", "newNestedAttribute"], function(methodNameToDelegate) {
    p[methodNameToDelegate] = function() { 
      throw(methodNameToDelegate + " not available until after resolve (and refs are bound to real relations)")
    }
  })

  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == C &&
             this._relationName == other._relationName
    }

  p.inspect = function(){return "*" + this._relationName }

  return C
}()

knit.NullRelation = function(){
  var C = function() {},
      p = C.prototype
  p.resolve = function(bindings) { return this }
  p.id = function() { return "nullRelation_id" }
  p.attributes = function() { return new knit.Attributes([]) }
  p.attr = function() { throw("Null Relation has no attributes") }
  p.inspect = function() { return "nullRelation" }
  p.merge = 
    p.split = function() { return this }
  p.newNestedAttribute = function() { throw("It doesn't make sense for Null Relation to create attributes") }
  p.isSame = 
    p.isEquivalent = function(other) { return this === other }
  return new C()  
}()

knit.AttributeReference = function(){
  var C = function(relationRef, attributeName) {
            this._attribute = new knit.UnresolvedAttributeReference(relationRef, attributeName)
          },
      p = C.prototype

  p.resolve = function(bindings) { 
    if (this._attribute.resolve) this._attribute = this._attribute.resolve(bindings) 
    return this
  }

  p.name = function() { return this._attribute.name() }
  p.fullyQualifiedName = function() { return this._attribute.fullyQualifiedName() }
  p.structuredName = function() { return this._attribute.structuredName() }
  p.type = function() { return this._attribute.type() }
  p.sourceRelation = function() { return this._attribute.sourceRelation() }
  p.isSame = 
    p.isEquivalent = function(other) { return this._attribute.isSame(other) }
  p.inspect = function(){return this._attribute.inspect()}

  return C
}()

knit.UnresolvedAttributeReference = function(){
  var _ = knit._util,
      C = function(relationRef, attributeName) {
            this._relationRef = relationRef
            this._attributeName = attributeName
          },
      p = C.prototype

  p.resolve = function(bindings) {
    return this._relationRef.resolve(bindings).attr(this._attributeName)
  }

  p.name = function() { return this._attributeName }
  p.fullyQualifiedName = function() { return this._attributeName }
  p.structuredName = function() { return this._attributeName }
  p.type = function() { return null }
  p.sourceRelation = function() { return this._relationRef }

  p.isSame = 
    p.isEquivalent = function(other) {
      return _.quacksLike(other, knit.signature.attribute) &&
             this.sourceRelation().isSame(other.sourceRelation()) &&
             this.name() == other.name()
    }

  p.inspect = function(){return "*" + this._attributeName}

  return C
}()

knit.NestedAttributeReference = function(){
  var _ = knit._util,
      C = function(attributeName, nestedAttributes) {
            this._attribute = new knit.UnresolvedNestedAttributeReference(attributeName, nestedAttributes)
          },
      p = C.prototype

  p.resolve = function(bindings) { 
    if (this._attribute.resolve)  this._attribute = this._attribute.resolve(bindings) 
    return this
  }

  p.name = function() { return this._attribute.name() }
  p.structuredName = function() { return this._attribute.structuredName() }
  p.fullyQualifiedName = function() { return this._attribute.fullyQualifiedName() }
  p.type = function() { return knit.attributeType.Nested }
  p.setSourceRelation = function(sourceRelation) { return this._attribute.setSourceRelation(sourceRelation) }
  p.sourceRelation = function() { return this._attribute.sourceRelation() }
  p.nestedRelation = function() { return this._attribute.nestedRelation() }

  p.isSame = 
    p.isEquivalent = function(other) {
      return _.quacksLike(other, knit.signature.attribute) &&
             this._attribute.isSame(other)
    }

  p.inspect = function(){return this._attribute.inspect()}

  return C
}()

knit.UnresolvedNestedAttributeReference = function(){
  var _ = knit._util,
      C = function(attributeName, nestedAttributes) {
            this._attributeName = attributeName
            this._nestedAttributes = nestedAttributes
            this._sourceRelation = knit.NullRelation
          },
      p = C.prototype

  p.resolve = function(bindings) { 
    _.each(this._nestedAttributes, function(nestedAttribute){nestedAttribute.resolve(bindings)})
    return this.sourceRelation().newNestedAttribute(this._attributeName, this._nestedAttributes)
  }

  p.name = function() { return this._attributeName }
  p.structuredName = function() { return this._attributeName }
  p.fullyQualifiedName = function() { return this._attributeName }
  p.type = function() { return knit.attributeType.Nested }
  p.sourceRelation = function() { return this._sourceRelation }
  p.setSourceRelation = function(sourceRelation) { this._sourceRelation = sourceRelation; return this }
  p.nestedRelation = function() { throw("nestedRelation is not available until after resolve") }

  p.isSame = 
    p.isEquivalent = function(other) {
      return _.quacksLike(other, knit.signature.attribute) &&
             this.sourceRelation().isSame(other.sourceRelation()) &&
             this.name() == other.name()
    }

  p.inspect = function(){return "*" + this._attributeName}

  return C
}()


knit.ReferenceEnvironment = function(){
  var _ = knit._util,
      C = function() {
            this._keyToRef = {}
            this._internalBindings = {}
          },
      p = C.prototype

  p.relation = function(relationName) {
    var relationRef = this._keyToRef[relationName] = this._keyToRef[relationName] || new knit.RelationReference(relationName)
    return relationRef
  }

  function regularAttr(relationNameDotAttributeName) {
    var key = relationNameDotAttributeName,
        parts = relationNameDotAttributeName.split("."),
        relationRef = this.relation(parts[0]),
        attributeName = parts[1],
        attributeRef = this._keyToRef[key] = this._keyToRef[key] || new knit.AttributeReference(relationRef, attributeName)
    return attributeRef
  }

  function nestedAttr(attributeName, nestedAttributeRefs) {
    var key = attributeName,
        attributeRef = this._keyToRef[key] = this._keyToRef[key] || new knit.NestedAttributeReference(attributeName, nestedAttributeRefs)
    return attributeRef
  }

  p.attr = function() {
    var args = _.toArray(arguments)
  
    if (args.length == 1) {
      var relationNameDotAttributeName = args[0]
      return knit._util.bind(regularAttr, this)(relationNameDotAttributeName)
    } else if (args.length==2 && _.isArray(args[1]) ){
      var attributeName = args[0],
          nestedAttributeRefs = args[1]
      return knit._util.bind(nestedAttr, this)(attributeName, nestedAttributeRefs)
    } else {
      var self = this
      return _.map(args, function(relationNameDotAttributeName){return self.attr(relationNameDotAttributeName)})
    }
  }

  p.resolve = function(externalBindings) {
    var self = this
    
    function resolveRelation(resolved, relationKey) {
      _.each(_.keys(externalBindings), function(relationKey){

        self.relation(relationKey).resolve(externalBindings)
        resolved.push(relationKey)

        _.each(externalBindings[relationKey].attributes(), function(attribute){
          resolveAttribute(resolved, relationKey, attribute)
        })
      })        
    }
    
    function resolveAttribute(resolved, relationKey, attribute) {
      var attributeKey = relationKey + "." + attribute.name()
      self.attr(attributeKey).resolve(externalBindings)
      resolved.push(attributeKey)        
    }
    
    
    var resolved = []
    _.each(_.keys(externalBindings), function(relationKey){ resolveRelation(resolved, relationKey) })
  
    var stillToResolve = _.differ(_.keys(this._keyToRef), resolved),
        allBindings = _.extend(externalBindings, this._internalBindings)
    _.each(stillToResolve, function(key){ self._keyToRef[key].resolve(allBindings) })
  
    return this
  }
  
  p.decorate = function(target, bindings) {
    target.relation = knit._util.bind(this.relation, this)
    target.attr = knit._util.bind(this.attr, this)
    
    var self = this,
        originalRename = target.rename
    target.rename = function(thing, alias) {
      var renameResult = originalRename(thing, alias)
      self._internalBindings[alias] = renameResult
      return renameResult
    }
    
    var resolveF = knit._util.bind(this.resolve, this)
    target.resolve = function(){resolveF(bindings())}
    return target
  }

  return C
}()