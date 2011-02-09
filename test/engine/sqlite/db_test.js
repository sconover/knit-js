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
  
  xtest("execute, query", function(){
    db.executeSync(new knit.engine.sql.statement.CreateTable("foo", [["color", knit.engine.sql.StringType]]))    
    db.executeSync(new knit.engine.sql.statement.Insert("foo", ["color"], ["red"]))
    
    var result = db.querySync(new knit.engine.sql.statement.Select(function(){
      from("foo")
    }))
    
    var justRows = _A.map(result, function(row){return row})
    assert.equal([{"color":"red"}], justRows)
  })
  
  test("list tables", function(){
    db.executeSync(new knit.engine.sql.statement.CreateTable("foo", [["color", knit.engine.sql.StringType]]))    
    db.executeSync(new knit.engine.sql.statement.CreateTable("bar", [["age", knit.engine.sql.IntegerType]]))    
    
    assert.equal(["bar", "foo"], db.listTables())
  })
  
  test("table definition", function(){
    db.executeSync(new knit.engine.sql.statement.CreateTable("foo", [["color", knit.engine.sql.StringType]]))    
    db.executeSync(new knit.engine.sql.statement.CreateTable("bar", [["age", knit.engine.sql.IntegerType]]))    
    
    assert.equal(new knit.engine.sql.statement.CreateTable("foo", [["color", knit.engine.sql.StringType]]), 
                 db.tableDefinition("foo"))
                 
    assert.equal(new knit.engine.sql.statement.CreateTable("bar", [["age", knit.engine.sql.IntegerType]]), 
                 db.tableDefinition("bar"))

  })
  

  
})
