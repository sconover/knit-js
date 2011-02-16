require("../../test_helper")
require("./sql_fakes.js")
require("knit/translation/sql")

regarding("order to sql", function() {
  
  beforeEach(function(){ setupPersonHouseCity(this, function(name, attributeNames){return new FakeTable(name, attributeNames)}) })
  var sql = knit.translation.sql
  
  regarding("translate expression to sql object", function() {
  
    test("asc", function(){
      var order = this.$R(function(){
        return order.asc(relation("person"), attr("person.name"))
      })
      assert.same(
        new sql.Select().
          from(this.person).
          order(new sql.Order(new sql.Column("person.name"), sql.Order.ASC)),
        order.toSql()
      )
    })

    test("desc", function(){
      var order = this.$R(function(){
        return order.desc(relation("person"), attr("person.name"))
      })
      assert.same(
        new sql.Select().
          from(this.person).
          order(new sql.Order(new sql.Column("person.name"), sql.Order.DESC)),
        order.toSql()
      )
    })

    test("nested orders - inner are leftmost", function(){
      var order = this.$R(function(){
        return order.asc(order.desc(relation("person"), attr("person.age")), attr("person.name"))
      })
      assert.same(
        new sql.Select().
          from(this.person).
          order(new sql.Order(new sql.Column("person.age"), sql.Order.DESC), 
                new sql.Order(new sql.Column("person.name"), sql.Order.ASC)),
        order.toSql()
      )
    })
    
  })


  regarding("sql object to sql statement", function() {
  
    test("asc", function(){
      assert.equal(
        " order by person.name",
        new sql.Select().
          from(this.person).
          order(new sql.Order(new sql.Column("person.name"), sql.Order.ASC)).toStatement().sql.split("from person")[1]
      )
    })

    test("desc", function(){
      assert.equal(
        " order by person.name desc",
        new sql.Select().
          from(this.person).
          order(new sql.Order(new sql.Column("person.name"), sql.Order.DESC)).toStatement().sql.split("from person")[1]
      )
    })

    test("nested orders - inner are leftmost", function(){
      assert.equal(
        " order by person.age desc, person.name",
        new sql.Select().
          from(this.person).
          order(new sql.Order(new sql.Column("person.age"), sql.Order.DESC), 
                new sql.Order(new sql.Column("person.name"), sql.Order.ASC)).toStatement().sql.split("from person")[1]
      )
    })
    
  })

})
