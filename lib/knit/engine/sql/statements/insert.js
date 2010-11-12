require("knit/engine/sql/statements/basic")

knit.engine.sql.statement.Insert = function(table, columns, values) {
  this._table = table
  this._columns = columns
  this._values = values
}

_.extend(knit.engine.sql.statement.Insert.prototype, knit.engine.sql.statement.Basic.prototype)

_.extend(knit.engine.sql.statement.Insert.prototype, {
  
  _dslLocals: function(){
    var self = this
    return {
    }
  },
  
  toSql: function() {
    var sql = "insert into " + this._table + 
              "(" + this._columns.join(",") + ")" + 
              " values(" + _.map(this._values,function(value){return "?"}).join(",") + ")"
    return {sql:sql, values:this._values}
  }
})