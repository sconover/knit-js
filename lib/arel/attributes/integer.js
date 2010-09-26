global["arel"] = global.arel || {};
arel.Attributes = arel.Attributes || {};

arel.Attributes.Integer = function(){};

arel.Attributes.Integer.prototype.typeCast = function(raw_value) {
  return raw_value;
  // return raw_value==null || raw_value==undefined ? raw_value : raw_value.toString();
};