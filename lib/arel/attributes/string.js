global["arel"] = global.arel || {};
arel.Attributes = arel.Attributes || {};

arel.Attributes.String = function(){};

arel.Attributes.String.prototype.typeCast = function(raw_value) {
  return raw_value==null || raw_value==undefined ? raw_value : raw_value.toString();
}