require("knit/engine/sql/statements/basic")

;(function(){
  var _A = CollectionFunctions.Array.functions
  
  knit.engine.sql.statement.Select = function(modifyFunction) {
    this._froms = []
    this._joins = []
    this._wheres = []
  
    if (modifyFunction) {
      this.modify(modifyFunction)
    }
  }

  _.extend(knit.engine.sql.statement.Select.prototype, knit.engine.sql.statement.Basic.prototype)

  _.extend(knit.engine.sql.statement.Select.prototype, {
  
    _dslLocals: function(){
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
    },
  
    toSql: function() {
      var sql = "select * from "
      var values = []
      sql +=  this._froms.join(", ")
    
      if (!_A.empty(this._joins)) {
        _.each(this._joins, function(joinInfo){
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
        _.each(this._wheres, function(predicate){
          var result = predicate.toSql()
          predicateStrings.push(result.sql)
          predicateValues.push(result.values)
        })
        sql += " where " + predicateStrings.join(" and ")
        values.push(predicateValues)
      }
      return {sql:sql, values:_.flatten(values)}
    }
  })

  knit.engine.sql.Operation = function(left, sign, right) {
    this.left = left
    this.sign = sign
    this.right = right || "?"
  }

  _.extend(knit.engine.sql.Operation.prototype, {
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

})()