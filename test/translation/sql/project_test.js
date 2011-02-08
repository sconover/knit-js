require("../../test_helper")
require("./sql_fakes.js")
require("knit/translation/sql")

regarding("project", function() {
  
  beforeEach(function(){ setupPersonHouseCity(this, function(name, attributeNames){return new FakeTable(name, attributeNames)}) })
  var sql = knit.translation.sql
  
  test("convert a project(proh-JEKT) to sql", function(){
    var project = this.$R(function(){
      return project(relation("person"), attr("person.name", "person.age"))
    })
    assert.equal(
      new sql.Select().
        what(new sql.Column("person.name"), new sql.Column("person.age")).
        from("person"),
      project.toSql()
    )
  })

})
