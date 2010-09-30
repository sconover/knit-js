require("arel/core");
require("arel/attribute");

arel.MutableRelation = function(name, attributes){
  this.name = function(){return name;};
  
  var attributes = attributes || [];
  this.attributes = function(){return attributes;};
};

arel.MutableRelation.prototype.attr = function(attrName, attrType) {
  this.attributes().push(new arel.Attribute(attrName, attrType))
  return this;
}

_.each(["tuples", "insert", "update", "delete"], function(functionName){
  arel.MutableRelation.prototype[functionName] =
    function(){throw new Error(functionName + " is available only in specialized relations");};
});
