require("../../test_helper")
require("knit/engine/sqlite/db")
require("knit/engine/sqlite/table")

regarding("table", function() {
  
  var _A = CollectionFunctions.Array.functions,
      type = knit.attributeType,
      sqlite = knit.engine.sqlite
  
  beforeEach(function(){ this.db = new knit.engine.sqlite.Database(":memory:"); this.db.open() })
  afterEach(function(){ this.db.close() })
  
  regarding("load from db", function() {
    
    test("name", function(){
      this.db.execute({sql:"create table foo(id int primary key)"})
      assert.equal("foo", sqlite.Table.load(this.db, "foo").name())
    })
    
    test("attributes", function(){
      this.db.execute({sql:"create table foo(id int primary key, color string, age int)"})
      this.db.execute({sql:"create table bar(id int primary key, color string)"})

      var foo = sqlite.Table.load(this.db, "foo")
      assert.equal([
          ["id", type.Integer], 
          ["color", type.String], 
          ["age", type.Integer]
        ],
        foo.attributes().namesAndTypes()
      )
      
      var bar = sqlite.Table.load(this.db, "bar")
      assert.same(foo.attr("color"), foo.attr("color"))
      assert.notSame(foo.attr("color"), bar.attr("color"))
    })
    
  })
  
})
