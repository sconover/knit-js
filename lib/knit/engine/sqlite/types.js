require("knit/core")

knit.engine.sqlite.ATTRIBUTE_TYPE_TO_SQLITE_COLUMN_TYPE = (function(){
  var mapping = {}
  mapping[knit.attributeType.Integer] = "int"
  mapping[knit.attributeType.String] = "string"
  return mapping
})()