require("knit/core")

knit.engine.sqlite.ATTRIBUTE_TYPE_TO_SQLITE_COLUMN_TYPE = (function(){
  var mapping = {}
  mapping[knit.attributeType.Integer] = "int"
  mapping[knit.attributeType.String] = "string"
  return mapping
})()

knit.engine.sqlite.SQLITE_COLUMN_TYPE_TO_ATTRIBUTE_TYPE = (function(){
  var _ = knit._util,
      mapping = {},
      reverseMapping = knit.engine.sqlite.ATTRIBUTE_TYPE_TO_SQLITE_COLUMN_TYPE
      
  _.each(_.keys(reverseMapping), function(attributeType){
    mapping[reverseMapping[attributeType]] = attributeType
  })
  return mapping
})()
