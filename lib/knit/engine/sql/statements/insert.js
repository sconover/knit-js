require("knit/engine/sql/statements/basic")

knit.engine.sql.statement.Insert = function(){

  var _A = CollectionFunctions.Array.functions

  var F = function(table, columns, values) {
    this._table = table
    this._columns = columns
    this._values = values
  }; var p = F.prototype
  
  knit._util.extend(p, knit.engine.sql.statement.Basic.prototype)

  p._dslLocals = function(){
    var self = this
    return {
    }
  }
  
  p.toSql = function() {
    var sql = "insert into " + this._table + 
              "(" + this._columns.join(",") + ")" + 
              " values(" + _A.map(this._values,function(value){return "?"}).join(",") + ")"
    return {sql:sql, values:this._values}
  }
  
  return F
}()