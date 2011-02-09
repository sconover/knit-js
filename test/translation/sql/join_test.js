require("../../test_helper")
require("./sql_fakes.js")
require("knit/translation/sql")

regarding("join to sql", function() {
  
  beforeEach(function(){ setupPersonHouseCity(this, function(name, attributeNames){return new FakeTable(name, attributeNames)}) })
  var sql = knit.translation.sql
  
  test("cartesian", function(){
    var join = this.$R(function(){
      return join(relation("person"), relation("house"))
    })
    assert.equal(
      new sql.Select().
        join(new sql.Join("person", "house", new sql.predicate.Equals(1,1))),
      join.toSql()
    )
  })

  test("with predicate", function(){
    var join = this.$R(function(){
      return join(relation("person"), relation("house"), eq(attr("house.houseId"), attr("person.houseId")))
    })
    assert.equal(
      new sql.Select().
        join(new sql.Join("person", "house", new sql.predicate.Equals(new sql.Column("house.houseId"), new sql.Column("person.houseId")))),
      join.toSql()
    )
  })

})
