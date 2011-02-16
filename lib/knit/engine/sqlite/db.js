var sqlite = require('sqlite')

knit.engine.sqlite.Database = function() {
  var _ = knit._util,
      TYPE_MAPPING = knit.engine.sqlite.ATTRIBUTE_TYPE_TO_SQLITE_COLUMN_TYPE,
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
  
  p.createTable = function(name, attributeNamesAndTypes, primaryKey) {
    primaryKey = primaryKey || []
    function attributeNamesAndTypesToColumnDefinitions(attributeNamesAndTypes) {
      return _.map(attributeNamesAndTypes, function(attributeNameAndType){
        var columnName = attributeNameAndType[0]
        var attributeType = attributeNameAndType[1]
        return columnName + " " + TYPE_MAPPING[attributeType] + (_.include(primaryKey, columnName) ? " primary key" : "")
      })
    }
    
    this.execute({sql:"create table " + name + 
                      " (" + attributeNamesAndTypesToColumnDefinitions(attributeNamesAndTypes).join(", ") + ")"})

    return knit.engine.sqlite.Table.load(this, name)
  }
  
  p.columnInformation = function(tableName) {
    return _.map(this.query({sql:"pragma table_info(" + tableName + ")"}), function(columnInfo){
      return {name:columnInfo.name, type:columnInfo.type, pk:columnInfo.pk}
    })
  }

  return F
}()