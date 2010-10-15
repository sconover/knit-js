require("arel/core");

arel.Attribute = function(name, type){
  this.name = function(){return name}
  this.type = function(){return type}
}

arel.Attribute.IntegerType = "integer"
arel.Attribute.StringType = "string"



arel.Attributes = function(attributes){
  var arr = [].concat(attributes)
  
  arr.names = function() {
    return _.map(this, function(attr){return attr.name()})
  }
  
  arr.get = function() {
    var names = arguments
    var attrs = _.select(this, function(attr){return _.include(names, attr.name())})
    return new arel.Attributes(attrs)
  }
  
  return arr
}