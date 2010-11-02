require("../../test_helper")
require("knit/engine/sql/select_statement")

regarding("select statement", function() {
	
	regarding("to sql", function() {
		beforeEach(function(){
			select = new knit.engine.sql.SelectStatement()
		})
		
		test("simple", function(){
			
			select.modify(function(){
				from("person")
			})
			
			assert.equal("select * from person", select.toSql())
		})

		xtest("where", function(){knit(function(){
			select.
			  from("person").
			  where()
			assert.equal("select * from person", select.toSql())
		})})

	})
	
})
