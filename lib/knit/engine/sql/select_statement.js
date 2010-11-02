require("knit/core")

knit.engine.sql.SelectStatement = function() {
	this._froms = []
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
			
			where: function(predicate) {
				self._wheres.push(predicate)
			},
			
			eq: function(left, right) {
				return [left, "=", right]
			}
			
	  })
		
		modifyFunction(f)
	},

  toSql: function() {
		var sql = "select * from "
		sql +=  this._froms.join(", ")
		
		if (!_.isEmpty(this._wheres)) {
			var predicateStrings = _.map(this._wheres, function(predicate){
				var left = predicate[0]
				var sign = predicate[1]
				var right = predicate[2]
				return "" + left + " " + sign + " " + right
			})
			sql += " where " + predicateStrings.join(" and ")
		}
		
	  return sql
  }
})




