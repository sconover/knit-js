require("../../test_helper")
// require("knit/engine/sql/statements/ddl")
// require("knit/engine/sql/table")
// require("knit/engine/sql/db/sqlite")

xregarding("sql - basic relational expressions to sql", function() {
  beforeEach(function(){
    db = new knit.engine.sql.Sqlite(":memory:")
  })
  
  // xtest("select to sql", function(){
  //    var relation = this.$R(
  //      return select(relation("person"), eq(attr("person.name"), "Jane"))
  //    )
  //    
  //    assert.equal(new relation.toSqlStatement(), 
  //                 new knit.engine.sql.statement.Select().modify(
  //                   from("person")
  //                   where(eq("person.name").provideValue("Jane"))
  //                 ))
  //  })
})
