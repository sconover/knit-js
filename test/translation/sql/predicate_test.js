require("../../test_helper")
require("./sql_fakes.js")
require("knit/translation/sql")

regarding("predicates", function() {
  
  beforeEach(function(){ setupPersonHouseCity(this, function(name, attributeNames){return new FakeTable(name, attributeNames)}) })
  var sql = knit.translation.sql
  
  test("convert an equality to sql", function(){
    var equality = this.$R(function(){return eq(attr("person.name"), "Jane")})
    assert.equal(
      new sql.predicate.Equals(new sql.Column("person.name"), "Jane"),
      equality.toSql()
    )
  })

})
