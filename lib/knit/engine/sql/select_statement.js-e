require("knit/core")

knit.engine.sql.SelectStatement = function() {
	this._froms = []
	this._joins = []
	this._wheres = []
}

_.extend(knit.engine.sql.SelectStatement.prototype, {
	modify: function(f){
		var modifyFunction = new DSLFunction()
		var self = this

		_.extend(modifyFunction.dslLocals, {
		  
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
			
	  })
		
		modifyFunction(f)
	},
  
  toSql: function() {
		var sql = "select * from "
		sql +=  this._froms.join(", ")
		
    if (!_.isEmpty(this._joins)) {
      _.each(this._joins, function(joinInfo){
        var toTableName = joinInfo[0]
        var predicate = joinInfo[1]
        
        sql += " join " + toTableName 
        if (predicate) {
          sql += " on " + predicate.toSql()
        }
      })
    }
    
    if (!_.isEmpty(this._wheres)) {
      var predicateStrings = _.map(this._wheres, function(predicate){
        return predicate.toSql()
      })
      sql += " where " + predicateStrings.join(" and ")
    }
    
	  return sql
  }
})

knit.engine.sql.Operation = function(left, sign, right) {
  this.left = left
  this.sign = sign
  this.right = right
}

_.extend(knit.engine.sql.Operation.prototype, {
  toSql: function() {
    return "" + this.left + " " + this.sign + " " + this.right
  }
})