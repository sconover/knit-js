require("knit/core")

knit.function.Join = function(relationOne, relationTwo) {
  this.attributes = relationOne.attributes.concat(relationTwo.attributes)
  this.relationOne = relationOne
  this.relationTwo = relationTwo
}

knit.function.Join.prototype.isSame = function(other) {
  return other.constructor == knit.function.Join && 
         this.relationOne.isSame(other.relationOne) &&
         this.relationTwo.isSame(other.relationTwo)
}

knit.function.Join.prototype.isEquivalent = function(other) {
  return this.isSame(other) ||
           other.constructor == knit.function.Join && 
           this.relationOne.isSame(other.relationTwo) &&
           this.relationTwo.isSame(other.relationOne)
}


knit.locals.join = function(relationOne, relationTwo) {
  return new knit.function.Join(relationOne, relationTwo)
}