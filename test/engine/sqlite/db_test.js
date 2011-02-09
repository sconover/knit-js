require("../../test_helper")
require("knit/engine/sqlite/create_table")
require("knit/engine/sqlite/insert")
require("knit/engine/sqlite/db")

regarding("sqlite db", function() {
  
  var _A = CollectionFunctions.Array.functions
  
  beforeEach(function(){
    db = new knit.engine.sql.Sqlite(":memory:")
    db.open()
  })
  
  afterEach(function(){
    db.close()
  })
  
  test("execute, query", function(){
    db.execute({sql:"create table foo(color string)"})
    db.execute({sql:"insert into foo values('red')"})
    
    assert.equal([{"color":"red"}], db.query({sql:"select * from foo"}))
  })
  
  test("list tables", function(){
    db.execute({sql:"create table foo(color string)"})
    db.execute({sql:"create table bar(age int)"})    
    assert.equal(["bar", "foo"], db.listTables())
  })
  
  // xtest("table definition", function(){
  //   db.executeSync(new knit.engine.sql.statement.CreateTable("foo", [["color", knit.engine.sql.StringType]]))    
  //   db.executeSync(new knit.engine.sql.statement.CreateTable("bar", [["age", knit.engine.sql.IntegerType]]))    
  //   
  //   assert.equal(new knit.engine.sql.statement.CreateTable("foo", [["color", knit.engine.sql.StringType]]), 
  //                db.tableDefinition("foo"))
  //                
  //   assert.equal(new knit.engine.sql.statement.CreateTable("bar", [["age", knit.engine.sql.IntegerType]]), 
  //                db.tableDefinition("bar"))
  // 
  // })
  

  
})
