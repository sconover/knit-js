require("knit/core")

knit.algebra.predicate.Equality = function() {
  
  var F = function(leftAtom, rightAtom) {
    this.leftAtom = leftAtom
    this.rightAtom = rightAtom
  }

  F.prototype._isAttribute = function(thing) {
    return thing.name && !thing.attributes
  }
  
  F.prototype._attributesReferredTo = function() {
    var attributes = []
    if (this._isAttribute(this.leftAtom)) { 
      attributes.push(this.leftAtom)
    } 
    if (this._isAttribute(this.rightAtom)) { 
      attributes.push(this.rightAtom)
    } 
    return attributes
  }
  
  F.prototype._attributesFromRelations = function(relations) {
    var attributesFromRelations = []
    _.each(relations, function(r){attributesFromRelations = attributesFromRelations.concat(r.attributes())})
    return attributesFromRelations
  }

  F.prototype.concernedWithNoOtherRelationsBesides = function() {
    var expectedExclusiveRelations = _.toArray(arguments)
    var expectedExclusiveRelationAttributes = _.flatten(_.map(expectedExclusiveRelations, function(r){return r.attributes()}))
    
    var foundAnAttributeNotContainedByExpectedExclusiveRelations = 
      _.detect(this._attributesReferredTo(), function(attributeReferredTo){
        return !(_.detect(expectedExclusiveRelationAttributes, function(expectedAttr){return attributeReferredTo.isSame(expectedAttr)}))
      })
    return !foundAnAttributeNotContainedByExpectedExclusiveRelations
  }
    
  F.prototype.concernedWithAllOf = function() {
    var expectedRelations = _.toArray(arguments)
    var myAttributes = this._attributesReferredTo()
    
    _.each(this._attributesReferredTo(), function(attr){
      var relationToCheckOff = _.detect(expectedRelations, function(r){return attr.sourceRelation().isSame(r)})
      if (relationToCheckOff) expectedRelations = _.without(expectedRelations, relationToCheckOff)
    })

    return _.isEmpty(expectedRelations)
  }
    

  F.prototype._areTheseTwoThingsTheSame = function(a, b) {
    return a.isSame && b.isSame && a.isSame(b) || a == b
  }
  
  F.prototype.isSame = function(other) {  
    return other.constructor == F && 
           this._areTheseTwoThingsTheSame(this.leftAtom, other.leftAtom) &&
           this._areTheseTwoThingsTheSame(this.rightAtom, other.rightAtom)
  }
  
  F.prototype.isEquivalent = function(other) {
    return this.isSame(other) ||
             other.constructor == F && 
             this._areTheseTwoThingsTheSame(this.leftAtom, other.rightAtom) &&
             this._areTheseTwoThingsTheSame(this.rightAtom, other.leftAtom)
  }

  F.prototype._inspectAtom = function(value) {
    if (this._isAttribute(value)) {
      return value.inspect()
    } else if (typeof value == "string") {
      return "'" + value + "'"
    } else {
      return "" + value
    }
  }
  
  F.prototype.inspect = function() {
    return "eq(" + this._inspectAtom(this.leftAtom) + "," + 
                   this._inspectAtom(this.rightAtom) + ")" 
  }

  return F
}()

knit.dslLocals.equality = function(leftAtom, rightAtom) {
  return new knit.algebra.predicate.Equality(leftAtom, rightAtom)
}

knit.dslLocals.eq = knit.dslLocals.equality
