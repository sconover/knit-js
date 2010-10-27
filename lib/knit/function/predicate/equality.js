require("knit/core")

knit.function.predicate.Equality = function(leftAtom, rightAtom) { //har
  this.leftAtom = leftAtom
  this.rightAtom = rightAtom
}

_.extend(knit.function.predicate.Equality.prototype, {
  isSame: function(other) {
    return other.constructor == knit.function.predicate.Equality && 
           this.leftAtom.isSame(other.leftAtom) &&
           this.rightAtom.isSame(other.rightAtom)
  },
  
  isEquivalent: function(other) {
    return this.isSame(other) ||
             other.constructor == knit.function.predicate.Equality && 
             this.leftAtom.isSame(other.rightAtom) &&
             this.rightAtom.isSame(other.leftAtom)
  },
  
  inspect: function() {return "eq(" + this.leftAtom.inspect() + "," + 
                                      this.rightAtom.inspect() + ")" }
})

knit.locals.equality = function(leftAtom, rightAtom) {
  return new knit.function.predicate.Equality(leftAtom, rightAtom)
}

knit.locals.eq = knit.locals.equality