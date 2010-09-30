require("arel/core");
require("arel/attribute");

arel.Relation = function(name, attributes){
  this.name = function(){return name;};
  
  var attributes = attributes || [];
  this.attributes = function(){return attributes;};
  
  this.tuples = function(){throw new Error("tuples are available only in specialized relations");};
};

arel.Relation.prototype.attr = function(attrName, attrType) {
  this.attributes().push(new arel.Attribute(attrName, attrType))
  return this;
}
