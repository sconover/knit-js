var _ = require("knit/core/util")

knit.algebra.predicate.True.prototype.
  match = function(attributes, row) {
    return true
  }

knit.algebra.predicate.False.prototype.
  match = function(attributes, row) {
    return false
  }

knit.algebra.predicate.Equality.prototype.
  match = function(attributes, row) {
    function getValue(atom, attributes, row) {
      return _.quacksLike(atom, knit.signature.attribute) ? row[attributes.indexOf(atom)] : atom
    }

    var left = getValue(this.leftAtom, attributes, row)
    var right = getValue(this.rightAtom, attributes, row)
    return left == right
  }

knit.algebra.predicate.Conjunction.prototype.
  match = function(attributes, row) {
    return this.leftPredicate.match(attributes, row) && 
           this.rightPredicate.match(attributes, row)
  }  
