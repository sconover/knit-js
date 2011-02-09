// require("../../../test_helper")
// require("knit/engine/sql/statements/select")

xregarding("select statement", function() {
  
  regarding("to sql", function() {
    beforeEach(function(){
      select = new knit.engine.sql.statement.Select()
    })
    
    test("simple", function(){
      
      select.modify(function(){
        from("person")
      })
      
      assert.equal({sql:"select * from person",values:[]}, select.toSql())
    })

    test("where - and,eq", function(){

      select.modify(function(){
        from("person")        
        where(eq("name").provideValue("Jane"))
      })

      assert.equal({sql:"select * from person where name = ?", values:["Jane"]}, select.toSql())
      
      select.modify(function(){
        where(eq("hair").provideValue("Red"))
      })
      
      assert.equal({sql:"select * from person where name = ? and hair = ?", values:["Jane", "Red"]}, select.toSql())
    })

    test("simple join", function(){

      select.modify(function(){
        from("person")
        join("house")
      })

      assert.equal({sql:"select * from person join house", values:[]}, select.toSql())
    })

    test("join with predicate", function(){

      select.modify(function(){
        from("person")
        join("house", eq("person.houseId", "house.houseId"))
      })

      assert.equal({sql:"select * from person join house on person.houseId = house.houseId", values:[]}, select.toSql())
    })

    test("multiple joins", function(){

      select.modify(function(){
        from("person")
        join("house", eq("person.houseId", "house.houseId"))
        join("city")
      })

      assert.equal({sql:"select * from person join house on person.houseId = house.houseId join city", values:[]}, 
                   select.toSql())
    })

  })
  
})
