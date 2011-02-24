var sqlite = require('sqlite')

knit.engine.sqlite.Database = function() {
  var _ = knit._util,
      F = function(sqlite_db_string) {
            this._sqlite_db_string = sqlite_db_string
          },
      p = F.prototype

  p.open = function() { this._db = sqlite.openDatabaseSync(this._sqlite_db_string) }
  p.close = function() { this._db.close() }
  p.execute = function(statement) { this._db.query(statement.sql, statement.values) }

  function queryAsync(self, statement, rowCallback) {
    self._db.query(statement.sql, statement.values, function(rows) {
      _.each(_.map(rows, function(row){return row}), rowCallback)
      rowCallback(null)
    })
  }

  function querySync(self, statement) {
    //need to read these into a regular array for some reason...
    return _.map(self._db.query(statement.sql, statement.values), function(row){return row})
  }

  p.query = function(statement, rowCallback) {
    if (rowCallback) {
      return queryAsync(this, statement, rowCallback)
    } else {
      return querySync(this, statement)
    }
  }

  p.listTables = function() {
    var result = this._db.query(
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

  return F
}()