require("core");

global["arel"] = global.arel || {};
arel.Attributes = arel.Attributes || {};

arel.Attributes.Attribute = function(name){
  this.name = name;
};