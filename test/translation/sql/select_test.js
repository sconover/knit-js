require("../../test_helper")
require("./sql_fakes.js")
require("knit/translation/sql")

regarding("select", function() {
  
  beforeEach(function(){ setupPersonHouseCity(this, function(name, attributeNames){return new FakeTable(name, attributeNames)}) })
  var sql = knit.translation.sql
  
  test("convert a select to sql", function(){
    var project = this.$R(function(){
      return select(relation("person"), eq(attr("person.name"), "Jane"))
    })
    assert.equal(
      new sql.Select().
        from("person").
        where(new sql.predicate.Equals(new sql.Column("person.name"), "Jane")),
      project.toSql()
    )
  })

})
