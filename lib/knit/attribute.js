require("knit/core");

knit.Attribute = function(name, type){
  this.name = function(){return name}
  this.type = function(){return type}
}

knit.Attribute.prototype.isSame = function(other) {
  return this.name() == other.name() && this.type() == other.type()
}

knit.Attribute.IntegerType = "integer"
knit.Attribute.StringType = "string"



knit.Attributes = function(attributes){
  var arr = [].concat(attributes)
  
  arr.names = function() {
    return _.map(this, function(attr){return attr.name()})
  }
  
  arr.get = function() {
    var names = arguments
    var attrs = _.select(this, function(attr){return _.include(names, attr.name())})
    return new knit.Attributes(attrs)
  }
  
  return arr
}