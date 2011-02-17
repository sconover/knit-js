require("../../helper")
require("knit/core")
require("knit/engine/sqlite")

regarding("sqlite db", function() {
  
  var type = knit.attributeType
  
  beforeEach(function(){ this.db = new knit.engine.sqlite.Database(":memory:"); this.db.open() })
  afterEach(function(){ this.db.close() })
  
  test("execute, query", function(){
    this.db.execute({sql:"create table foo(color string)"})
    this.db.execute({sql:"insert into foo values('red')"})
    
    assert.equal([{"color":"red"}], this.db.query({sql:"select * from foo"}))
  })
  
  test("execute, query async", function(){
    this.db.execute({sql:"create table foo(color string)"})
    this.db.execute({sql:"insert into foo values('red')"})
    var objects = []
    this.db.query({sql:"select * from foo"}, function(next){
      if (next == null) {
        assert.equal([{"color":"red"}], objects)
      } else {
        objects.push(next)
      }
    })
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
        [{name:"id", type:"int", pk:"1"},
         {name:"color", type:"string", pk:"0"}],
        this.db.columnInformation("foo")
      )      
    }) 
    
  })
  
})
