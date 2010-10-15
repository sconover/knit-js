require("knit/core")
require("knit/attribute")


knit.ImmutableRelation = function(name, attributes){
  this.name = function(){return name}
  
  var attributes = new knit.Attributes(attributes || [])  
  this.attributes = function(){return attributes}
}



knit.MutableRelation = function(name, attributes){
  _.extend(this, new knit.ImmutableRelation(name, attributes))
}

knit.MutableRelation.prototype.attr = function(attrName, attrType) {
  this.attributes().push(new knit.Attribute(attrName, attrType))
  return this
}

_.each(["tuples", "insert", "update", "delete"], function(functionName){
  knit.MutableRelation.prototype[functionName] =
    function(){throw new Error(functionName + " is available only in specialized relations")}
})
