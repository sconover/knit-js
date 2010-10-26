require("knit/core")

knit.JoinFunction = function(relationOne, relationTwo) {
  this.attributes = relationOne.attributes.concat(relationTwo.attributes)
  this.relationOne = relationOne
  this.relationTwo = relationTwo
}

knit.JoinFunction.prototype.isSame = function(other) {
  return other.constructor == knit.JoinFunction && 
         this.relationOne.isSame(other.relationOne) &&
         this.relationTwo.isSame(other.relationTwo)
}

knit.JoinFunction.prototype.isEquivalent = function(other) {
  return this.isSame(other) ||
           other.constructor == knit.JoinFunction && 
           this.relationOne.isSame(other.relationTwo) &&
           this.relationTwo.isSame(other.relationOne)
}


knit.locals.join = function(relationOne, relationTwo) {
  return new knit.JoinFunction(relationOne, relationTwo)
}