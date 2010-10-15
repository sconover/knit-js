require("knit/attribute")

knit.Projection = function(relation, attributes){
  this.name = function(){return relation.name()}
  
  var attributes = new knit.Attributes(attributes)
  this.attributes = function(){return attributes}
};
