require("arel/core");

arel.Attribute = function(name, type){
  this.name = function(){return name;};
  this.type = function(){return type;};
};

arel.Attribute.IntegerType = "integer";
arel.Attribute.StringType = "string";
