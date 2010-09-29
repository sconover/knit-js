require("arel/core");


arel.Attribute = function(name, type){
  this.name = name;
  this.type = type;
};

arel.Attribute.IntegerType = "integer";
arel.Attribute.StringType = "string";
