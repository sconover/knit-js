require("../../../test_helper")
require("../sql_fakes.js")
require("knit/translation/sql")

regarding("equality to sql", function() {
  
  beforeEach(function(){ setupPersonHouseCity(this, function(name, attributeNames){return new FakeTable(name, attributeNames)}) })
  var sql = knit.translation.sql
  
  test("left and right are values", function(){
    var equality = this.$R(function(){
      return eq(1,2)
    })
    assert.equal(
      new sql.predicate.Equals(1,2),
      equality.toSql()
    )
  })

  test("attr and values", function(){
    var equality = this.$R(function(){
      return eq(attr("person.name"), "Jane")
    })
    assert.equal(
      new sql.predicate.Equals(new sql.Column("person.name"), "Jane"),
      equality.toSql()
    )
  })

  test("two attributes", function(){
    var equality = this.$R(function(){
      return eq(attr("house.houseId"), attr("person.houseId"))
    })
    assert.equal(
      new sql.predicate.Equals(new sql.Column("house.houseId"), new sql.Column("person.houseId")),
      equality.toSql()
    )
  })

})
