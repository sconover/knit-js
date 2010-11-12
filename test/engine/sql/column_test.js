require("../../test_helper")
require("knit/engine/sql/Column")

regarding("sql - Column", function() {
  test("two Columns are the same if they have the same name and table name", function(){
    assert.same(new knit.engine.sql.Column("house_id", "person"),
                new knit.engine.sql.Column("house_id", "person"))

    assert.notSame(new knit.engine.sql.Column("house_id", "person"),
                   new knit.engine.sql.Column("age", "person"))

    assert.notSame(new knit.engine.sql.Column("house_id", "person"),
                   new knit.engine.sql.Column("house_id", "house"))
  })
  
  test("equivalence is the same as sameness", function(){
    assert.equivalent(new knit.engine.sql.Column("house_id", "person"),
                      new knit.engine.sql.Column("house_id", "person"))

    assert.notEquivalent(new knit.engine.sql.Column("house_id", "person"),
                         new knit.engine.sql.Column("age", "person"))

    assert.notEquivalent(new knit.engine.sql.Column("house_id", "person"),
                         new knit.engine.sql.Column("house_id", "house"))
  })
  
  test("inspect", function(){
    assert.equal("house_id", new knit.engine.sql.Column("house_id", "person").inspect())
  })
})
