require("arel/core");
require("arel/relation");

arel.NaturalJoin = function(relationOne, relationTwo){
  var combinedName = relationOne.name() + "__" + relationTwo.name();
  var combinedAttributes = relationOne.attributes().concat(relationTwo.attributes())
  
  this.name = function(){return combinedName;};
  this.attributes = function(){return combinedAttributes;};
};