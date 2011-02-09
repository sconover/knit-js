require("knit/engine/sqlite/types")

knit.engine.sql.statement.CreateTable = function(){
  var _A = CollectionFunctions.Array.functions
  
  var F = function(tableName, columns) {
    this.tableName = tableName
    this.columns = columns
  }; var p = F.prototype

  F.ATTRIBUTE_TYPE_TO_SQL_TYPE = [
    [knit.engine.sql.IntegerType, "integer"],
    [knit.engine.sql.StringType, "varchar(255)"]
  ]

  p.toSql = function() {
    return {sql:"create table " + this.tableName +
                "(" + _A.map(this.columns, function(attrInfo){
                             var name = attrInfo[0]
                             var type = attrInfo[1]
                             var mapping = 
                               _A.detect(knit.engine.sql.statement.CreateTable.ATTRIBUTE_TYPE_TO_SQL_TYPE,
                                        function(mapping){return mapping[0]==type})
                             var sqlType = mapping[1]
                             return name + " " + sqlType
                           }).join(", ")  + ")",
            values:[]} 
  }
  
  return F
}()
