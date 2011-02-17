require("../../../helper")
require("../sql_fakes.js")
require("knit/translation/sql")

regarding("conjunction to sql", function() {
  
  beforeEach(function(){ setupPersonHouseCity(this, function(name, attributeNames){return new FakeTable(name, attributeNames)}) })
  var sql = knit.translation.sql
  
  regarding("predicate to sql object", function() {
  
    test("shallow", function(){
      var and = this.$R(function(){
        return and(eq(1,1),eq(2,2))
      })
      assert.equal(
        new sql.predicate.And(
          new sql.predicate.Equals(1,1),
          new sql.predicate.Equals(2,2)
        ),
        and.toSql()
      )
    })

    test("nested", function(){
      var and = this.$R(function(){
        return and(eq(1,1),and(eq(2,2),eq(3,3)))
      })
      assert.equal(
        new sql.predicate.And(
          new sql.predicate.Equals(1,1),
          new sql.predicate.And(
            new sql.predicate.Equals(2,2),
            new sql.predicate.Equals(3,3)
          )
        ),
        and.toSql()
      )
    })
    
  })

  regarding("sql object to statement", function() {

    test("shallow", function(){
      assert.equal(
        {sql:"person.age = ? and person.age = ?", values:[1,2]},
        new sql.predicate.And(
          new sql.predicate.Equals(new sql.Column("person.age"),1),
          new sql.predicate.Equals(new sql.Column("person.age"),2)
        ).toStatement()
      )
    })

    test("nested", function(){
      assert.equal(
        {sql:"person.age = ? and person.age = ? and ? = person.age", values:[1,2,3]},
        new sql.predicate.And(
          new sql.predicate.Equals(new sql.Column("person.age"),1),
          new sql.predicate.And(
            new sql.predicate.Equals(new sql.Column("person.age"),2),
            new sql.predicate.Equals(3,new sql.Column("person.age"))
          )
        ).toStatement()
      )
    })

  })

})
