require("arel/core");
require("arel/attribute");

arel.Relation = function(){};

arel.Relation.Heading = function(attributes) {
  _.each(attributes, function(attribute){this.push(attribute)}.bind(this));
};

arel.Relation.Heading.prototype = [];