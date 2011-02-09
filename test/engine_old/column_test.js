

xregarding("sql - Column", function() {
  test("two Columns are the same if they have the same name and table name", function(){
    assert.same(new knit.engine.sql.Column("houseId", "person"),
                new knit.engine.sql.Column("houseId", "person"))

    assert.notSame(new knit.engine.sql.Column("houseId", "person"),
                   new knit.engine.sql.Column("age", "person"))

    assert.notSame(new knit.engine.sql.Column("houseId", "person"),
                   new knit.engine.sql.Column("houseId", "house"))
  })
  
  test("equivalence is the same as sameness", function(){
    assert.equivalent(new knit.engine.sql.Column("houseId", "person"),
                      new knit.engine.sql.Column("houseId", "person"))

    assert.notEquivalent(new knit.engine.sql.Column("houseId", "person"),
                         new knit.engine.sql.Column("age", "person"))

    assert.notEquivalent(new knit.engine.sql.Column("houseId", "person"),
                         new knit.engine.sql.Column("houseId", "house"))
  })
  
  test("inspect", function(){
    assert.equal("houseId", new knit.engine.sql.Column("houseId", "person").inspect())
  })
})
