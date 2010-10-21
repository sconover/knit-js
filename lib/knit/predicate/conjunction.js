require("knit/core")

knit.predicate.Conjunction = function(leftPredicate, rightPredicate){
  this.split = function(){return [leftPredicate, rightPredicate]}
}