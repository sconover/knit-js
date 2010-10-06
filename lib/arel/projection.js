require("arel/attribute")

arel.Projection = function(relation, attributes){
  this.name = function(){return relation.name()}
  
  var attributes = new arel.Attributes(attributes)
  this.attributes = function(){return attributes}
};
