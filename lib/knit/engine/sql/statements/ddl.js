require("knit/engine/sql/types")
require("knit/engine/sql/statements/basic")

knit.engine.sql.statement.CreateTable = function(tableName, columns) {
  this.tableName = tableName
  this.columns = columns
}

knit.engine.sql.statement.CreateTable.ATTRIBUTE_TYPE_TO_SQL_TYPE = [
  [knit.engine.sql.IntegerType, "integer"],
  [knit.engine.sql.StringType, "varchar(255)"]
]

_.extend(knit.engine.sql.statement.CreateTable.prototype, {
  
  toSql: function() {
    return {sql:"create table " + this.tableName +
                "(" + _.map(this.columns, function(attrInfo){
                             var name = attrInfo[0]
                             var type = attrInfo[1]
                             var mapping = 
                               _.detect(knit.engine.sql.statement.CreateTable.ATTRIBUTE_TYPE_TO_SQL_TYPE,
                                        function(mapping){return mapping[0]==type})
                             var sqlType = mapping[1]
                             return name + " " + sqlType
                           }).join(", ")  + ")",
            values:[]} 
  }
})
