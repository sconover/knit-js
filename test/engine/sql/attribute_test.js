require("../../test_helper")
require("knit/engine/sql/attribute")

regarding("sql - attribute", function() {
  test("two attributes are the same if they have the same name and table name", function(){
    assert.same(new knit.engine.sql.Attribute("house_id", "person"),
                new knit.engine.sql.Attribute("house_id", "person"))

    assert.notSame(new knit.engine.sql.Attribute("house_id", "person"),
                   new knit.engine.sql.Attribute("age", "person"))

    assert.notSame(new knit.engine.sql.Attribute("house_id", "person"),
                   new knit.engine.sql.Attribute("house_id", "house"))
  })
  
  test("equivalence is the same as sameness", function(){
    assert.equivalent(new knit.engine.sql.Attribute("house_id", "person"),
                      new knit.engine.sql.Attribute("house_id", "person"))

    assert.notEquivalent(new knit.engine.sql.Attribute("house_id", "person"),
                         new knit.engine.sql.Attribute("age", "person"))

    assert.notEquivalent(new knit.engine.sql.Attribute("house_id", "person"),
                         new knit.engine.sql.Attribute("house_id", "house"))
  })
  
  test("inspect", function(){
    assert.equal("house_id", new knit.engine.sql.Attribute("house_id", "person").inspect())
  })
})
