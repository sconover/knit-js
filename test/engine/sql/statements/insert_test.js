require("../../../test_helper")
require("knit/engine/sql/statements/insert")

regarding("insert statement", function() {
  
  regarding("to sql", function() {

    test("simple", function(){
      assert.equal({sql:"insert into foo(color) values(?)", values:["red"]}, 
                   new knit.engine.sql.statement.Insert("foo", ["color"], ["red"]).toSql())
    })

  })
  
})
