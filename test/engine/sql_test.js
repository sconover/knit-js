require("../test_helper")
require("knit/engine/sql")
require("knit/engine/sql/db/sqlite")

regarding("sql", function() {
  beforeEach(function(){
    db = new knit.engine.sql.Sqlite(":memory:")
    db.open()
    engine = new knit.engine.Sql(db)
  })
  
  afterEach(function(){
    db.close()
  })
  
  test("creating a relation means create the table", function(){
    engine.createRelation("person", [
      ["id", knit.engine.sql.IntegerType],
      ["house_id", knit.engine.sql.IntegerType],
      ["name", knit.engine.sql.StringType],
      ["age", knit.engine.sql.IntegerType]
    ])
    
    assert.equal(["person"], db.listTables())
    assert.equal(new knit.engine.sql.statement.CreateTable("person", [
                   ["id", knit.engine.sql.IntegerType],
                   ["house_id", knit.engine.sql.IntegerType],
                   ["name", knit.engine.sql.StringType],
                   ["age", knit.engine.sql.IntegerType]
                 ]), 
                 db.tableDefinition("person"))
  })
  
  test("you get a table object back, which is a kind of relation", function(){
    var person = engine.createRelation("person", [
      ["id", knit.engine.sql.IntegerType],
      ["house_id", knit.engine.sql.IntegerType],
      ["name", knit.engine.sql.StringType],
      ["age", knit.engine.sql.IntegerType]
    ])
    
    assert.equal("person", person.name)
    assert.equal(["id", "house_id", "name", "age"], 
                 _.map(person.attributes, function(attr){return attr.name}))
  })
  
  // test("attribute equality", function(){
  //   var person = engine.createRelation("person", [
  //     ["id", knit.engine.sql.IntegerType],
  //     ["house_id", knit.engine.sql.IntegerType]
  //   ])
  //   
  //   var house = engine.createRelation("house", [
  //     ["house_id", knit.engine.sql.IntegerType]
  //   ])
  //   
  //   assert.same(person.attr("house_id"), person.attr("house_id"))
  //   assert.notSame(person.attr("house_id"), house.attr("house_id"))
  // })
  // 
})
