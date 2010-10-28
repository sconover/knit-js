require("knit/core")

knit.function.predicate.Equality = function(leftAtom, rightAtom) { //har
  this.leftAtom = leftAtom
  this.rightAtom = rightAtom
}

_.extend(knit.function.predicate.Equality.prototype, {
  _isThisAtomOnlyConcernedWithThisRelation: function(atom, relation) {
    if (atom instanceof knit.Attribute) { 
      return _.include(relation.attributes, atom)
    } else {
      return true
    }
  },

  onlyConcernedWith: function(relation) {
    return this._isThisAtomOnlyConcernedWithThisRelation(this.leftAtom, relation) && 
           this._isThisAtomOnlyConcernedWithThisRelation(this.rightAtom, relation)
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
    if (typeof value == "string") {
      return "'" + value + "'"
    } else {
      return "" + value
    }
  },
  
  inspect: function() {return "eq(" + this._inspectPrimitive(this.leftAtom) + "," + 
                                      this._inspectPrimitive(this.rightAtom) + ")" }
})

knit.locals.equality = function(leftAtom, rightAtom) {
  return new knit.function.predicate.Equality(leftAtom, rightAtom)
}

knit.locals.eq = knit.locals.equality