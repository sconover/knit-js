require("../../helper")
require("knit/core")
require("knit/engine/sqlite")

regarding("sqlite conn", function() {
  
  var type = knit.attributeType
  
  beforeEach(function(){ this.conn = new knit.engine.sqlite.Connection(":memory:"); this.conn.open() })
  afterEach(function(){ this.conn.close() })
  
  test("execute, query", function(){
    this.conn.execute({sql:"create table foo(color string)"})
    this.conn.execute({sql:"insert into foo values('red')"})
    
    assert.equal([{"color":"red"}], this.conn.query({sql:"select * from foo"}))
  })
  
  test("execute, query async", function(){
    this.conn.execute({sql:"create table foo(color string)"})
    this.conn.execute({sql:"insert into foo values('red')"})
    var objects = []
    this.conn.query({sql:"select * from foo"}, function(next){
      if (next == null) {
        assert.equal([{"color":"red"}], objects)
      } else {
        objects.push(next)
      }
    })
  })
  
  test("list tables", function(){
    this.conn.execute({sql:"create table foo(color string)"})
    this.conn.execute({sql:"create table bar(age int)"})    
    assert.equal(["bar", "foo"], this.conn.listTables())
  })
    
})
