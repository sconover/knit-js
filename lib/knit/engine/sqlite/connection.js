var sqlite = require('sqlite')
var _ = require("knit/core/util")

knit.engine.sqlite.Connection = (function() {
  
  var C = function(sqlite_connection_string) {
            this._sqlite_connection_string = sqlite_connection_string
          },
      p = C.prototype

  p.open = function() { this._conn = sqlite.openDatabaseSync(this._sqlite_connection_string) }
  p.close = function() { this._conn.close() }
  p.execute = function(statement) { this._conn.query(statement.sql, statement.values) }

  function queryAsync(self, statement, rowCallback) {
    self._conn.query(statement.sql, statement.values, function(rows) {
      _.each(_.map(rows, function(row){return row}), rowCallback)
      rowCallback(null)
    })
  }

  function querySync(self, statement) {
    //need to read these into a regular array for some reason...
    return _.map(self._conn.query(statement.sql, statement.values), function(row){return row})
  }

  p.query = function(statement, rowCallback) {
    if (rowCallback) {
      return queryAsync(this, statement, rowCallback)
    } else {
      return querySync(this, statement)
    }
  }

  p.listTables = function() {
    var result = this._conn.query(
      "select name from sqlite_master " +
      "where type='table' " +
      "order by name"
    )
    return _.map(result, function(row){return row.name})
  }
  
  p.columnInformation = function(tableName) {
    return _.map(this.query({sql:"pragma table_info(" + tableName + ")"}), function(columnInfo){
      return {name:columnInfo.name, type:columnInfo.type, pk:columnInfo.pk}
    })
  }

  return C
})()