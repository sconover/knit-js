require("arel/core")
require("arel/attribute")


arel.ImmutableRelation = function(name, attributes){
  this.name = function(){return name}
  
  var attributes = new arel.Attributes(attributes || [])  
  this.attributes = function(){return attributes}
}



arel.MutableRelation = function(name, attributes){
  _.extend(this, new arel.ImmutableRelation(name, attributes))
}

arel.MutableRelation.prototype.attr = function(attrName, attrType) {
  this.attributes().push(new arel.Attribute(attrName, attrType))
  return this
}

_.each(["tuples", "insert", "update", "delete"], function(functionName){
  arel.MutableRelation.prototype[functionName] =
    function(){throw new Error(functionName + " is available only in specialized relations")}
})
