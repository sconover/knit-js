require("knit/core")

knit.algebra.predicate.Equality = function() {
  var _A = CollectionFunctions.Array.functions
      F = function(leftAtom, rightAtom) {
            this.leftAtom = leftAtom
            this.rightAtom = rightAtom
          },
      p = F.prototype

  function isAttribute(thing) { return knit.quacksLike(thing, knit.signature.attribute) }
  p.leftIsAttribute = function(thing) { return isAttribute(this.leftAtom) }
  p.rightIsAttribute = function(thing) { return isAttribute(this.rightAtom) }
  
  p._attributesReferredTo = function() {
    var attributes = []
    if (this.leftIsAttribute()) { attributes.push(this.leftAtom) } 
    if (this.rightIsAttribute()) { attributes.push(this.rightAtom) } 
    return new knit.Attributes(attributes)
  }
  
  p._attributesFromRelations = function(relations) {
    var allAttributes = new knit.Attributes([])
    _A.each(relations, function(r){allAttributes = allAttributes.concat(r.attributes())})
    return allAttributes
  }

  p.concernedWithNoOtherRelationsBesides = function() {    
    var expectedExclusiveRelations = _A.toArray(arguments)
    var allAttributes = new knit.Attributes([])
    _A.each(expectedExclusiveRelations, function(r){allAttributes = allAttributes.concat(r.attributes())})
    
    return this._attributesReferredTo().differ(allAttributes).empty()
  }
    
  p.concernedWithAllOf = function() {
    var expectedRelations = _A.toArray(arguments)
    var myAttributes = this._attributesReferredTo()
    
    this._attributesReferredTo().each(function(attr){
      var relationToCheckOff = _A.detect(expectedRelations, function(r){return attr.sourceRelation().isSame(r)})
      if (relationToCheckOff) expectedRelations = _A.without(expectedRelations, relationToCheckOff)
    })

    return _A.empty(expectedRelations)
  }
    

  function areTheseTwoThingsTheSame(a, b) {
    return a.isSame && b.isSame && a.isSame(b) || a == b
  }
  
  p.isSame = function(other) {  
    return other.constructor == F && 
           areTheseTwoThingsTheSame(this.leftAtom, other.leftAtom) &&
           areTheseTwoThingsTheSame(this.rightAtom, other.rightAtom)
  }
  
  p.isEquivalent = function(other) {
    return this.isSame(other) ||
             other.constructor == F && 
             areTheseTwoThingsTheSame(this.leftAtom, other.rightAtom) &&
             areTheseTwoThingsTheSame(this.rightAtom, other.leftAtom)
  }


  function inspectAtom(value) {
    if (value.inspect) {
      return value.inspect()
    } else if (typeof value == "string") {
      return "'" + value + "'"
    } else {
      return "" + value
    }
  }
  
  p.inspect = function() {     
    return "eq(" + inspectAtom(this.leftAtom) + "," + inspectAtom(this.rightAtom) + ")" 
  }

  return F
}()

knit.createBuilderFunction.dslLocals.equality = function(leftAtom, rightAtom) {
  return new knit.algebra.predicate.Equality(leftAtom, rightAtom)
}

knit.createBuilderFunction.dslLocals.eq = knit.createBuilderFunction.dslLocals.equality
