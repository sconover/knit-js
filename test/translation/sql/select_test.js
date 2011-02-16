require("../../test_helper")
require("./sql_fakes.js")
require("knit/translation/sql")

regarding("select", function() {
  
  beforeEach(function(){ setupPersonHouseCity(this, function(name, attributeNames){return new FakeTable(name, attributeNames)}) })
  var sql = knit.translation.sql
  
  regarding("translate expression to sql object", function(){  

    test("same (wheres are different)", function(){
      assert.same(new sql.Select().where(new sql.predicate.Equals(new sql.Column("person.name"), "Jane")), 
                  new sql.Select().where(new sql.predicate.Equals(new sql.Column("person.name"), "Jane")))
      assert.notSame(new sql.Select().where(new sql.predicate.Equals(new sql.Column("person.name"), "ZZZZZZZZZ")), 
                     new sql.Select().where(new sql.predicate.Equals(new sql.Column("person.name"), "Jane")))
    })
    
    test("convert a select to sql", function(){
      var select = this.$R(function(){
        return select(relation("person"), eq(attr("person.name"), "Jane"))
      })
      
      assert.same(
        new sql.Select().
          what(this.person.columns().map(function(col){return new sql.Column("person." + col.name())})).
          from(this.person).
          where(new sql.predicate.Equals(new sql.Column("person.name"), "Jane")),
        select.toSql()
      )
    })
    
  })
  
  regarding("sql object (involving where) to statement", function(){
    var select_person_beginning = 
      "select person.personId as person$$personId, person.houseId as person$$houseId, person.name as person$$name, " +
      "person.age as person$$age from person "
    test("where clause - simple", function(){
      assert.equal(
        {sql:select_person_beginning + "where person.name = ?", values:["Jane"]},
        new sql.Select().
          from(this.person).
          where(new sql.predicate.Equals(new sql.Column("person.name"), "Jane")).toStatement()
      )
    })
    
    test("'and' is implied between wheres", function(){
      assert.equal(
        {sql:select_person_beginning + "where person.name = ? and person.age = ? and ? = ?", values:["Jane", 5, 7, 7]},
        new sql.Select().
          from(this.person).
          where(new sql.predicate.Equals(new sql.Column("person.name"), "Jane")).
          where(new sql.predicate.Equals(new sql.Column("person.age"), 5)).
          where(new sql.predicate.Equals(7, 7)).toStatement()
      )
    })
    
    test("where clause - conjunction", function(){
      assert.equal(
        {sql:select_person_beginning + "where person.name = ? and person.age = ?", values:["Jane", 5]},
        new sql.Select().
          from(this.person).
          where(
            new sql.predicate.And(
              new sql.predicate.Equals(new sql.Column("person.name"), "Jane"),
              new sql.predicate.Equals(new sql.Column("person.age"), 5)
            )
          ).toStatement()
      )
    })
    
  })

})
