require("../../test_helper")
require("./sql_fakes.js")
require("knit/translation/sql")

regarding("join to sql", function() {
  
  beforeEach(function(){ setupPersonHouseCity(this, function(name, attributeNames){return new FakeTable(name, attributeNames)}) })
  var sql = knit.translation.sql
  
  regarding("expression to sql object", function() {
    
    test("cartesian", function(){
      var join = this.$R(function(){
        return join(relation("person"), relation("house"))
      })
      assert.equal(
        new sql.Select().
          join(new sql.Join("person", "house", null)),
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
  
  regarding("sql object to sql statement", function() {
  
    test("cartesian", function(){
      assert.equal(
        "select * from person join house",
        new sql.Select().
          join(new sql.Join("person", "house", null)).toStatement().sql
      )
    })

    test("with predicate", function(){
      assert.equal(
        "select * from person join house on house.houseId = person.houseId",
        new sql.Select().
          join(new sql.Join("person", "house", new sql.predicate.Equals(new sql.Column("house.houseId"), new sql.Column("person.houseId")))).
          toStatement().sql
      )
    })    
    
  })
})
