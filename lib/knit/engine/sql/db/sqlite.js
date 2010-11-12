var sqlite = require('sqlite')
require("knit/engine/sql")

knit.engine.sql.Sqlite = function(sqlite_db_string) {
  this._sqlite_db_string = sqlite_db_string
}

_.extend(knit.engine.sql.Sqlite.prototype, {
  
  open: function() {
    this._db = sqlite.openDatabaseSync(this._sqlite_db_string)
  },
  
  close: function() {
    this._db.close()
  },
  
  executeSync: function(statement) {
    var sqlAndValues = statement.toSql()
    this._db.query(sqlAndValues.sql, sqlAndValues.values)
  },

  querySync: function(statement) {
    var sqlAndValues = statement.toSql()
    return this._db.query(sqlAndValues.sql, sqlAndValues.values)
  },
  
  listTables: function() {
    var result = this._db.query(
      "select name from sqlite_master " +
      "where type='table' " +
      "order by name"
    )
    return _.map(result, function(row){return row.name})
  },
  
  tableDefinition: function(tableName) {
    var result = this._db.query("pragma table_info(" + tableName + ")")
    var columns = _.map(result, function(row){
      var knitType = _.detect(knit.engine.sql.statement.CreateTable.ATTRIBUTE_TYPE_TO_SQL_TYPE, function(mapping) {
        return mapping[1] == row.type
      })
      return [row.name, knitType[0]]
    })
    return new knit.engine.sql.statement.CreateTable(tableName, columns)
  }
})
