var sqlite = require('sqlite')

knit.engine.sqlite.Database = function() {
  var _A = CollectionFunctions.Array.functions
  
  var F = function(sqlite_db_string) {
    this._sqlite_db_string = sqlite_db_string
  }; var p = F.prototype

  p.open = function() {
    this._db = sqlite.openDatabaseSync(this._sqlite_db_string)
  }

  p.close = function() {
    this._db.close()
  }

  p.execute = function(statement) {
    this._db.query(statement.sql, statement.values)
  }

  p.query = function(statement) {
    //need to read these into a regular array for some reason...
    return _A.map(this._db.query(statement.sql, statement.values), function(row){return row})
  }

  p.listTables = function() {
    var result = this._db.query(
      "select name from sqlite_master " +
      "where type='table' " +
      "order by name"
    )
    return _A.map(result, function(row){return row.name})
  }

  // p.tableDefinition = function(tableName) {
  //   var result = this._db.query("pragma table_info(" + tableName + ")")
  //   var columns = _A.map(result, function(row){
  //     var knitType = _A.detect(knit.engine.sql.statement.CreateTable.ATTRIBUTE_TYPE_TO_SQL_TYPE, function(mapping) {
  //       return mapping[1] == row.type
  //     })
  //     return [row.name, knitType[0]]
  //   })
  //   return new knit.engine.sql.statement.CreateTable(tableName, columns)
  // }
  
  return F
}()