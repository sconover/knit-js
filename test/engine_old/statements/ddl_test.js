// require("../../../test_helper")
// require("knit/engine/sql/statements/ddl")

xregarding("ddl statements", function() {
  
  regarding("create table", function() {

    test("to sql", function(){
      assert.equal({sql:"create table widget(id integer, type varchar(255), sku integer)", values:[]}, 
                   new knit.engine.sql.statement.CreateTable("widget", [
                     ["id", knit.engine.sql.IntegerType],
                     ["type", knit.engine.sql.StringType],
                     ["sku", knit.engine.sql.IntegerType]
                   ]).toSql())
    })

  })
  
})
