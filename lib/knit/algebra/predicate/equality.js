require("knit/core")

knit.algebra.predicate.Equality = function() {
  
  var F = function(leftAtom, rightAtom) {
    this.leftAtom = leftAtom
    this.rightAtom = rightAtom
  }

  F.prototype._isAttribute = function(thing) {
    return thing.name
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
     var argsForWithout = [this._attributesReferredTo()].concat(this._attributesFromRelations(expectedExclusiveRelations))
    return _.isEmpty(_.without.apply(this, argsForWithout))
  }
    
  F.prototype.concernedWithAllOf = function() {
    var expectedRelations = _.toArray(arguments)
    var myAttributes = this._attributesReferredTo()

    var self = this
    var expectedRelationsWithNotAttributesFoundHere = _.select(expectedRelations, function(relation){
      return _.isEmpty(_.intersect(relation.attributes(), myAttributes))
    })
  
    return _.isEmpty(expectedRelationsWithNotAttributesFoundHere)
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

  F.prototype._inspectPrimitive = function(value) {
    if (this._isAttribute(value)) {
      return value.inspect()
    } else if (typeof value == "string") {
      return "'" + value + "'"
    } else {
      return "" + value
    }
  }
  
  F.prototype.inspect = function() {
    return "eq(" + this._inspectPrimitive(this.leftAtom) + "," + 
                   this._inspectPrimitive(this.rightAtom) + ")" 
  }

  return F
}()

knit.dslLocals.equality = function(leftAtom, rightAtom) {
  return new knit.algebra.predicate.Equality(leftAtom, rightAtom)
}

knit.dslLocals.eq = knit.dslLocals.equality
