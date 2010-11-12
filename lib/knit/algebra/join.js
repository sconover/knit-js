require("knit/core")
require("knit/algebra/predicate")

knit.algebra.Join = function(relationOne, relationTwo, predicate) {
  this._attributes = relationOne.attributes().concat(relationTwo.attributes())
  this.relationOne = relationOne
  this.relationTwo = relationTwo
  this.predicate = predicate || new knit.algebra.predicate.True()
}

_.extend(knit.algebra.Join.prototype, {
  attributes: function(){ return this._attributes },
  
  _predicateIsDefault: function() {
    return this.predicate.isSame(new knit.algebra.predicate.True())
  },
  
  appendToPredicate: function(additionalPredicate) {
    if (this._predicateIsDefault()) {
      this.predicate = additionalPredicate
    } else {
      this.predicate = new knit.algebra.predicate.Conjunction(this.predicate, additionalPredicate)
    }
    return this
  },

  isSame: function(other) {
    return other.constructor == knit.algebra.Join && 
           this.relationOne.isSame(other.relationOne) &&
           this.relationTwo.isSame(other.relationTwo) &&
           this.predicate.isSame(other.predicate)
  },
 
  isEquivalent: function(other) {
    return this.isSame(other) ||
             other.constructor == knit.algebra.Join && 
  
             ((this.relationOne.isSame(other.relationOne) &&
              this.relationTwo.isSame(other.relationTwo)) ||
  
             (this.relationOne.isSame(other.relationTwo) &&
              this.relationTwo.isSame(other.relationOne))) &&

             this.predicate.isEquivalent(other.predicate)
  },
  
  split: function(){return this},
  merge: function(){return this},
  
  inspect: function(){
    var inspectStr = "join(" + this.relationOne.inspect() + "," + this.relationTwo.inspect()
    
    if (!this._predicateIsDefault()) {
      inspectStr += "," + this.predicate.inspect()
    }
    
    inspectStr += ")"
    return inspectStr
  }
})


knit.dslLocals.join = function(relationOne, relationTwo, predicate) {
  return new knit.algebra.Join(relationOne, relationTwo, predicate)
}
