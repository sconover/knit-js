require("arel/attributes/attribute");

arel.Attributes.Integer = function(name){
  this.name = name;
};
Object.inherits(arel.Attributes.Integer, arel.Attributes.Attribute);

arel.Attributes.Integer.prototype.typeCast = function(raw_value) {
  
  if (typeof raw_value == "string") {
    raw_value = raw_value.replace(" ", "");
    if (raw_value.substr(0,1) == ".") {
      raw_value = "0" + raw_value;
    }
  }
  
  if (raw_value==null || raw_value==undefined) {
    return raw_value;
  } else if (raw_value=="") {
    return null;
  } else {
    return parseInt(raw_value);
  }
};