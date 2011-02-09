// require("../test_helper")
// require("knit/engine/sql")
// require("knit/engine/sql/db/sqlite")

xregarding("sql", function() {
  var _A = CollectionFunctions.Array.functions

  beforeEach(function(){
    db = new knit.engine.sql.Sqlite(":memory:")
    db.open()
    engine = new knit.engine.Sql(db)
  })
  
  afterEach(function(){
    db.close()
  })
  
  xtest("creating a relation means create the table", function(){
    engine.createRelation("person", [
      ["id", knit.engine.sql.IntegerType],
      ["houseId", knit.engine.sql.IntegerType],
      ["name", knit.engine.sql.StringType],
      ["age", knit.engine.sql.IntegerType]
    ])
    
    assert.equal(["person"], db.listTables())
    assert.equal(new knit.engine.sql.statement.CreateTable("person", [
                   ["id", knit.engine.sql.IntegerType],
                   ["houseId", knit.engine.sql.IntegerType],
                   ["name", knit.engine.sql.StringType],
                   ["age", knit.engine.sql.IntegerType]
                 ]), 
                 db.tableDefinition("person"))
  })
  
  xtest("you get a table object back, which is a kind of relation", function(){
    var person = engine.createRelation("person", [
      ["id", knit.engine.sql.IntegerType],
      ["houseId", knit.engine.sql.IntegerType],
      ["name", knit.engine.sql.StringType],
      ["age", knit.engine.sql.IntegerType]
    ])
    
    assert.equal("person", person.name())
    assert.equal(["id", "houseId", "name", "age"], 
                 _A.map(person.attributes(), function(attr){return attr.name()}))
  })
  
  // test("attribute equality", function(){
  //   var person = engine.createRelation("person", [
  //     ["id", knit.engine.sql.IntegerType],
  //     ["houseId", knit.engine.sql.IntegerType]
  //   ])
  //   
  //   var house = engine.createRelation("house", [
  //     ["houseId", knit.engine.sql.IntegerType]
  //   ])
  //   
  //   assert.same(person.attr("houseId"), person.attr("houseId"))
  //   assert.notSame(person.attr("houseId"), house.attr("houseId"))
  // })
  // 
})
