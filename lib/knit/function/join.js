require("knit/core")

knit.function.Join = function(relationOne, relationTwo) {
  this.attributes = relationOne.attributes.concat(relationTwo.attributes)
  this.relationOne = relationOne
  this.relationTwo = relationTwo
}

_.extend(knit.function.Join.prototype, {
  isSame: function(other) {
    return other.constructor == knit.function.Join && 
           this.relationOne.isSame(other.relationOne) &&
           this.relationTwo.isSame(other.relationTwo)
  },
 
  isEquivalent: function(other) {
    return this.isSame(other) ||
             other.constructor == knit.function.Join && 
             this.relationOne.isSame(other.relationTwo) &&
             this.relationTwo.isSame(other.relationOne)
  },
  
  split: function(){return this},
  merge: function(){return this}
})


knit.locals.join = function(relationOne, relationTwo) {
  return new knit.function.Join(relationOne, relationTwo)
}