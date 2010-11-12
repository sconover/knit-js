require("../../test_helper")
require("knit/engine/sql/statements/ddl")
require("knit/engine/sql/table")
require("knit/engine/sql/db/sqlite")

regarding("sql - table", function() {
  beforeEach(function(){
    db = new knit.engine.sql.Sqlite(":memory:")
    db.open()

    db.executeSync(new knit.engine.sql.statement.CreateTable("person", [
      ["id", knit.engine.sql.IntegerType],
      ["house_id", knit.engine.sql.IntegerType],
      ["name", knit.engine.sql.StringType],
      ["age", knit.engine.sql.IntegerType]
    ]))

    db.executeSync(new knit.engine.sql.statement.CreateTable("house", [
      ["house_id", knit.engine.sql.IntegerType]
    ]))
  })
  
  afterEach(function(){
    db.close()
  })
  
  
  test("tables are the same if they have the same name", function(){
    assert.same(new knit.engine.sql.Table("person", db),
                new knit.engine.sql.Table("person", db))

    assert.notSame(new knit.engine.sql.Table("person", db),
                   new knit.engine.sql.Table("house", db))
  })
  
  test("equivalence is the same as sameness", function(){
    assert.equivalent(new knit.engine.sql.Table("person", db),
                      new knit.engine.sql.Table("person", db))

    assert.notEquivalent(new knit.engine.sql.Table("person", db),
                         new knit.engine.sql.Table("house", db))
  })
  
  test("inspect", function(){
    var person = new knit.engine.sql.Table("person", db)
    assert.equal("person[id,house_id,name,age]", person.inspect())
  })
})
