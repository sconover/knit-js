require("knit/engine/sql/statements/basic")

knit.engine.sql.statement.Select = function() {
  var _A = CollectionFunctions.Array.functions,
      _ = knit._util
      
  var F = function(modifyFunction) {
    this._froms = []
    this._joins = []
    this._wheres = []
  
    if (modifyFunction) {
      this.modify(modifyFunction)
    }
  }; var p = F.prototype
  
  _.extend(p, knit.engine.sql.statement.Basic.prototype)
  
  p._dslLocals = function(){
    var self = this
    return {
      from: function(tableName) {
        self._froms.push(tableName)
      },
  
      join: function(toTableName, predicate) {
        self._joins.push([toTableName, predicate])
      },
  
      where: function(predicate) {
        self._wheres.push(predicate)
      },
  
      eq: function(left, right) {
        return new knit.engine.sql.Operation(left, "=", right)
      }
    }
  }

  p.toSql = function() {
    var sql = "select * from "
    var values = []
    sql +=  this._froms.join(", ")
  
    if (!_A.empty(this._joins)) {
      _A.each(this._joins, function(joinInfo){
        var toTableName = joinInfo[0]
        var predicate = joinInfo[1]
      
        sql += " join " + toTableName 
        if (predicate) {
          sql += " on " + predicate.toSql().sql
        }
      })
    }
  
    if (!_A.empty(this._wheres)) {
      var predicateStrings = []
      var predicateValues = []
      _A.each(this._wheres, function(predicate){
        var result = predicate.toSql()
        predicateStrings.push(result.sql)
        predicateValues.push(result.values)
      })
      sql += " where " + predicateStrings.join(" and ")
      values.push(predicateValues)
    }
    return {sql:sql, values:_A.flatten(values)}
  }

  return F
}()

knit.engine.sql.Operation = function(left, sign, right) {
  this.left = left
  this.sign = sign
  this.right = right || "?"
}

knit._util.extend(knit.engine.sql.Operation.prototype, {
  provideValue: function(value) {
    this.value = value
    return this
  },

  values: function() {
    return this.value==undefined ? [] : [this.value]
  },

  toSql: function() {
    return {sql:"" + this.left + " " + this.sign + " " + this.right, values:this.values()}
  }
})
