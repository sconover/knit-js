require("arel/core");

arel.Attribute = function(name, type){
  this.name = function(){return name}
  this.type = function(){return type}
}

arel.Attribute.IntegerType = "integer"
arel.Attribute.StringType = "string"



arel.Attributes = function(attributes){
  _.each(attributes, function(attr){this.push(attr)}.bind(this))
}

arel.Attributes.prototype = []

arel.Attributes.prototype.names = function(){
  return _.map(this, function(attr){return attr.name()})
}

arel.Attributes.prototype.concat = function(other) {
  var result = new arel.Attributes([])
  _.each(this, function(attr){result.push(attr)})
  _.each(other, function(attr){result.push(attr)})
  return result
}

arel.Attributes.prototype.get = function() {
  var names = arguments
  var attrs = _.select(this, function(attr){return _.include(names, attr.name())})
  return new arel.Attributes(attrs)
}