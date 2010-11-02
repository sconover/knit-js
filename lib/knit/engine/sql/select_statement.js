require("knit/core")

knit.engine.sql.SelectStatement = function() {
	this._froms = []
}

_.extend(knit.engine.sql.SelectStatement.prototype, {
	modify: function(f){
		var modifyFunction = new DSLFunction()
		var self = this

		_.extend(modifyFunction.dslLocals, {
		  
		  from: function(tableName) {
		    self._froms.push(tableName)
			}
			
	  })
		
		modifyFunction(f)
	},

  toSql: function() {
	  return "select * from " + this._froms.join(", ")
  }
})




