require("knit/core")

knit.JoinFunction = function(relationOne, relationTwo) {
  this.attributes = relationOne.attributes().concat(relationTwo.attributes())
}

knit.locals.join = function(relationOne, relationTwo) {
  return new knit.JoinFunction(relationOne, relationTwo)
}