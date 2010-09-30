require("arel/core");
require("arel/attribute");

arel.Relation = function(name, attributes){
  this.name = function(){return name;};
  
  var heading = new arel.Relation.Heading(attributes || []);
  this.heading = function(){return heading;};
  
  this.tuples = function(){throw new Error("tuples are available only in specialized relations");};
};

arel.Relation.prototype.attr = function(attr_name, attr_type) {
  this.heading().push(new arel.Attribute(attr_name, attr_type))
  return this;
}


arel.Relation.Heading = function(attributes) {
  _.each(attributes, function(attribute){this.push(attribute)}.bind(this));
};

arel.Relation.Heading.prototype = [];