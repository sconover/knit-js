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

    test("where - and,eq", function(){

      select.modify(function(){
        from("person")        
        where(eq("name", "'Jane'"))
      })

      assert.equal("select * from person where name = 'Jane'", select.toSql())
      
      select.modify(function(){
        where(eq("hair", "'Red'"))
      })
      
      assert.equal("select * from person where name = 'Jane' and hair = 'Red'", select.toSql())
    })

    test("simple join", function(){

      select.modify(function(){
        from("person")
        join("house")
      })

      assert.equal("select * from person join house", select.toSql())
    })

    test("join with predicate", function(){

      select.modify(function(){
        from("person")
        join("house", eq("person.house_id", "house.house_id"))
      })

      assert.equal("select * from person join house on person.house_id = house.house_id", select.toSql())
    })

    test("multiple joins", function(){

      select.modify(function(){
        from("person")
        join("house", eq("person.house_id", "house.house_id"))
        join("city")
      })

      assert.equal("select * from person join house on person.house_id = house.house_id join city", select.toSql())
    })

	})
	
})
