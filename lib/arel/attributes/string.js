require("arel/attributes/attribute");

arel.Attributes.String = function(name){
  this.name = name;
};
Object.inherits(arel.Attributes.String, arel.Attributes.Attribute);

arel.Attributes.String.prototype.typeCast = function(raw_value) {
  return raw_value==null || raw_value==undefined ? raw_value : raw_value.toString();
};