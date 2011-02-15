require("../../test_helper")
require("./sql_fakes.js")
require("knit/translation/sql")

//select retains base relations and base attrs until the last moment (tostring?)
//drive this ... relation.attributes() needs to be the real column instances...
xregarding("sql select is a relation", function() {
  
  beforeEach(function(){ setupPersonHouseCity(this, function(name, attributeNames){return new FakeTable(name, attributeNames)}) })
  var sql = knit.translation.sql

  test("'what' contains the attributes", function(){
    var project = this.$R(function(){
      return project(relation("person"), attr("person.name", "person.age"))
    })
    assert.equal(
      new sql.Select().
        what(new sql.Column("person.name"), new sql.Column("person.age")).
        from({"person":this.person}),
      project.toSql()
    )
  })

})
