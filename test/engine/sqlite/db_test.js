require("../../test_helper")
require("knit/engine/sqlite/db")

regarding("sqlite db", function() {
  
  var _A = CollectionFunctions.Array.functions
  var type = knit.attributeType
  
  beforeEach(function(){
    this.db = new knit.engine.sqlite.Database(":memory:")
    this.db.open()
  })
  
  afterEach(function(){
    this.db.close()
  })
  
  test("execute, query", function(){
    this.db.execute({sql:"create table foo(color string)"})
    this.db.execute({sql:"insert into foo values('red')"})
    
    assert.equal([{"color":"red"}], this.db.query({sql:"select * from foo"}))
  })
  
  test("list tables", function(){
    this.db.execute({sql:"create table foo(color string)"})
    this.db.execute({sql:"create table bar(age int)"})    
    assert.equal(["bar", "foo"], this.db.listTables())
  })
  
  
  regarding("create table", function(){
    test("requires attribute type information and information about the primary key",function(){
      this.db.createTable("foo", [["id",type.Integer], ["color",type.String]], ["id"])
      
      assert.equal(
        [{name:"id", type:"int", pk:"0"},
         {name:"color", type:"string", pk:"0"}],
        this.db.columnInformation("foo")
      )
      
    })    
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
