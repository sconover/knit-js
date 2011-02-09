require("../../test_helper")
require("./sql_fakes.js")
require("knit/translation/sql")

regarding("select", function() {
  
  beforeEach(function(){ setupPersonHouseCity(this, function(name, attributeNames){return new FakeTable(name, attributeNames)}) })
  var sql = knit.translation.sql
  
  regarding("translate algrbra to sql object", function(){  
    
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
  
  regarding("sql object (involving where) to statement", function(){

    test("where clause - simple", function(){
      assert.equal(
        {sql:"select * from person where person.name = ?", values:["Jane"]},
        new sql.Select().
          from("person").
          where(new sql.predicate.Equals(new sql.Column("person.name"), "Jane")).toStatement()
      )
    })
    
    xtest("where clause - nested", function(){
      assert.equal(
        {sql:"select * from person where person.name = ?", values:["Jane"]},
        new sql.Select().
          from("person").
          where(new sql.predicate.Equals(new sql.Column("person.name"), "Jane")).toStatement()
      )
    })
    
  })

})
