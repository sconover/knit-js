require("knit/core")

knit.function.predicate.Equality = function(leftAtom, rightAtom) { //har
  this.leftAtom = leftAtom
  this.rightAtom = rightAtom
}

_.extend(knit.function.predicate.Equality.prototype, {
	_isAttribute: function(thing) {
		return thing.name && thing.type
	},
	
  _attributesReferredTo: function() {
	  var attributes = []
    if (this._isAttribute(this.leftAtom)) { 
	    attributes.push(this.leftAtom)
    } 
    if (this._isAttribute(this.rightAtom)) { 
	    attributes.push(this.rightAtom)
    } 
    return attributes
  },
  
  _attributesFromRelations: function(relations) {
	  var attributesFromRelations = []
	  _.each(relations, function(r){attributesFromRelations = attributesFromRelations.concat(r.attributes)})
	  return attributesFromRelations
  },

  concernedWithNoOtherRelationsBesides: function() {
	  var expectedExclusiveRelations = _.toArray(arguments)
 	  var argsForWithout = [this._attributesReferredTo()].concat(this._attributesFromRelations(expectedExclusiveRelations))
	  return _.isEmpty(_.without.apply(this, argsForWithout))
  },
    
  concernedWithAllOf: function() {
	  var expectedRelations = _.toArray(arguments)
    var myAttributes = this._attributesReferredTo()

	  var self = this
	  var expectedRelationsWithNotAttributesFoundHere = _.select(expectedRelations, function(relation){
		  return _.isEmpty(_.intersect(relation.attributes, myAttributes))
	  })
	
	  return _.isEmpty(expectedRelationsWithNotAttributesFoundHere)
  },
    

  _areTheseTwoThingsTheSame: function(a, b) {
    return a.isSame && b.isSame && a.isSame(b) || a == b
  },
  
  isSame: function(other) {  
    return other.constructor == knit.function.predicate.Equality && 
           this._areTheseTwoThingsTheSame(this.leftAtom, other.leftAtom) &&
           this._areTheseTwoThingsTheSame(this.rightAtom, other.rightAtom)
  },
  
  isEquivalent: function(other) {
    return this.isSame(other) ||
             other.constructor == knit.function.predicate.Equality && 
             this._areTheseTwoThingsTheSame(this.leftAtom, other.rightAtom) &&
             this._areTheseTwoThingsTheSame(this.rightAtom, other.leftAtom)
  },

  _inspectPrimitive: function(value) {
	  if (this._isAttribute(value)) {
			return value.inspect()
    } else if (typeof value == "string") {
      return "'" + value + "'"
    } else {
      return "" + value
    }
  },
  
  inspect: function() {return "eq(" + this._inspectPrimitive(this.leftAtom) + "," + 
                                      this._inspectPrimitive(this.rightAtom) + ")" }
})

knit.dslLocals.equality = function(leftAtom, rightAtom) {
  return new knit.function.predicate.Equality(leftAtom, rightAtom)
}

knit.dslLocals.eq = knit.dslLocals.equality