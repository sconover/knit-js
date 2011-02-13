require("../../test_helper")
require("./sql_fakes.js")
require("knit/translation/sql")

regarding("starting relation", function() {
  
  beforeEach(function(){ setupPersonHouseCity(this, function(name, attributeNames){return new FakeTable(name, attributeNames)}) })
  var sql = knit.translation.sql
  
  regarding("it's a valid relation", function(){
    
    test("attributes/columns", function(){
      assert.equal(this.person.attributes(),
                   new sql.Select().from({"person":this.person}).columns())
      
      assert.equal(this.person.attributes(),
                   new sql.Select().from({"person":this.person}).attributes())
      
      assert.equal(this.person.attributes().concat(this.house.attributes()),
                   new sql.Select().from({"person":this.person}, {"house":this.house}).attributes())
    })

    test("sql select quacksLike a relation", function(){
      assert.quacksLike(new sql.Select().from({"person":this.person}), knit.signature.relation)
    })
        
    test("simple same (from-only)", function(){
      assert.same(new sql.Select().from({"person":this.person}), new sql.Select().from({"person":this.person}))
      assert.same(new sql.Select().from({"person":this.person}, {"house":this.house}), new sql.Select().from({"person":this.person}, {"house":this.house}))
      assert.notSame(new sql.Select().from({"person":this.person}), new sql.Select().from({"person":this.person}, {"house":this.house}))
      assert.notSame(new sql.Select().from({"person":this.person}, {"city":this.city}), new sql.Select().from({"person":this.person}, {"house":this.house}))
    })
    
  })
  
  xregarding("translate expression to sql object", function(){
    
    test("convert a straight relation reference to sql", function(){
      var relation = this.$R(function(){
        return relation("person")
      })
      assert.equal(
        new sql.Select().
          what(this.person.columns()).
          from({"person":this.person}),
        relation.toSql()
      )
    })
    
  })
  
  xregarding("sql object to statement", function(){

    test("simple select statement.  what defaults to star.", function(){
      assert.equal(
        "select person. from person",
        new sql.Select().from("person").toStatement().sql
      )
    })
    
    test("multiple froms", function(){
      assert.equal(
        "select * from person, house",
        new sql.Select().from("person", "house").toStatement().sql
      )
    })
    
  })
  
})
