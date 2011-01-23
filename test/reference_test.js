require("./test_helper.js")
require("knit/reference")
require("./algebra/test_relation.js")

regarding("references allow late-binding of core relations and attributes. " +
          "and it allows knit to support situations where relations and attributes are brought into being late in runtime " +
          " - creation of nested attributes in nest, creating of new relations in normalize, etc.", function() {
    
  beforeEach(function() {
    person = new knit.TestRelationFunction(["id", "houseId", "name", "age"])
    
    environment = new knit.ReferenceEnvironment()
  })


  regarding("relation reference", function() {

    regarding("sameness and equivalence", function() {
  
      test("two unresolved references naming the same relation are the same", function(){
        assert.same(environment.relation("person"), environment.relation("person"))
        assert.notSame(environment.relation("person"), environment.relation("personZZZ"))
        assert.notSame(environment.relation("person"), person)
      })
      
      test("...in fact, it's the same object", function(){
        assert.equal(true, environment.relation("person") === environment.relation("person"))
      })
      
      test("two resolved references to the same relation are the same", function(){
        environment.relation("person")
        environment.resolve({person:person})
        assert.same(environment.relation("person"), person)
        assert.same(environment.relation("person"), environment.relation("person"))
      })
      
      test("equivalent is like same", function(){
        assert.equivalent(environment.relation("person"), environment.relation("person"))
        environment.resolve({person:person})
        assert.equivalent(environment.relation("person"), environment.relation("person"))
        assert.notEquivalent(environment.relation("personX"), environment.relation("personZZZ"))
      })
      
    })
    
    regarding("resolving a reference to a real relation", function() {
      test("you can refer to relations as strings, then the environment swaps the string out for the real thing.", function(){
        var personRef = environment.relation("personZ")
        assert.notSame(personRef, person)
      
        environment.resolve({personZ:person})
        assert.same(personRef, person)
      })
    })
      
    test("inspect", function(){
      assert.equal("personZ", environment.relation("personZ").inspect())
    })
  
  })
  
  regarding("attribute reference", function() {
  
    test("you can refer to attributes as strings and then resolve to real attributes at perform time", function(){
      var ageRef = environment.attr({"personZ":"age"})
      assert.notSame(ageRef, person.attr("age")) //attr method naming collision coming...
      
      environment.resolve({personZ:person})
      assert.same(ageRef, person.attr("age"))
    })

    test("inspect", function(){
      assert.equal("age", environment.attr({"personZ":"age"}).inspect())
    })

  
    regarding("sameness and equivalence", function() {
    
      test("two unresolved references naming the same attribute are the same", function(){
        assert.same(environment.attr({"person":"age"}), environment.attr({"person":"age"}))
        assert.notSame(environment.attr({"person":"age"}), environment.attr({"personZZZ":"age"}))
        assert.notSame(environment.attr({"person":"age"}), environment.attr({"person":"ageZZZ"}))
      })
      
      test("...in fact, it's the same object", function(){
        assert.equal(true, environment.attr({"person":"age"}) === environment.attr({"person":"age"}))
      })

      test("two resolved references to the same attribute are the same", function(){
        environment.attr({"person":"age"})
        environment.resolve({person:person})
        
        assert.same(environment.attr({"person":"age"}), person.attr("age"))
        assert.same(environment.attr({"person":"age"}), environment.attr({"person":"age"}))
      })
      
      test("equivalent is like same", function(){
        assert.equivalent(environment.attr({"person":"age"}), environment.attr({"person":"age"}))
        assert.notEquivalent(environment.attr({"person":"age"}), environment.attr({"personZZZ":"age"}))
      })
        
    })
  })
  
  regarding("relation and attribute referencing is resolved on the way out of a knit builder function", function() {
    test("relation refs are resolved on the way out according to the bindings set up", function(){      
      var $R = knit.makeBuilderFunction({bindings:{person:person}})
      var personResult = $R(function(){return relation("person")})
      assert.same(personResult, person)
    })

    test("attribute refs are resolved on the way out according to the bindings set up", function(){
      var $R = knit.makeBuilderFunction({bindings:{person:person}})
      
      var ageResult = $R(function(){return attr({"person":"age"})})
      assert.same(ageResult, person.attr("age"))
    })

    test("bindings can be a function", function(){
      var $R = knit.makeBuilderFunction({bindings:function(){return {person:person}}})
      
      var personResult = $R(function(){return relation("person")})
      assert.same(personResult, person)
    })
  })
  
})

