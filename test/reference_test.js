require("./test_helper.js")
require("knit/reference")
require("./algebra/test_relation.js")

regarding("references allow late-binding of core relations and attributes. " +
          "and it allows knit to support situations where relations and attributes are brought into being late in runtime " +
          " - creation of nested attributes in nest, creating of new relations in normalize, etc.", function() {
    
  beforeEach(function() {
    person = new TestRelation(["id", "houseId", "name", "age"])
    
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
      
      test("two resolved references to the same relation are the same (both ways)", function(){
        environment.relation("person")
        environment.resolve({person:person})
        assert.same(environment.relation("person"), person)
        assert.same(person, environment.relation("person"))
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
      assert.equal("*personZ", environment.relation("personZ").inspect())
    })
  
  })
  
  regarding("attribute reference", function() {
  
    test("you can refer to attributes as strings and then resolve to real attributes at perform time", function(){
      var ageRef = environment.attr("personZ.age")
      assert.notSame(ageRef, person.attr("age")) //attr method naming collision coming...
      
      environment.resolve({personZ:person})
      assert.same(ageRef, person.attr("age"))
    })

    test("inspect", function(){
      assert.equal("*age", environment.attr("personZ.age").inspect())
    })

  
    regarding("sameness and equivalence", function() {
    
      test("two unresolved references naming the same attribute are the same", function(){
        assert.same(environment.attr("person.age"), environment.attr("person.age"))
        assert.notSame(environment.attr("person.age"), environment.attr("personZZZ.age"))
        assert.notSame(environment.attr("person.age"), environment.attr("person.ageZZZ"))
      })
      
      test("...in fact, it's the same object", function(){
        assert.equal(true, environment.attr("person.age") === environment.attr("person.age"))
      })

      test("two resolved references to the same attribute are the same(both ways)", function(){
        environment.attr("person.age")
        environment.resolve({person:person})
        
        assert.same(environment.attr("person.age"), person.attr("age"))
        assert.same(person.attr("age"), environment.attr("person.age"))
        assert.same(environment.attr("person.age"), environment.attr("person.age"))
      })
      
      test("equivalent is like same", function(){
        assert.equivalent(environment.attr("person.age"), environment.attr("person.age"))
        assert.notEquivalent(environment.attr("person.age"), environment.attr("personZZZ.age"))
      })
        
    })
  })
  
  regarding("nested attribute reference", function() {
    
    beforeEach(function() {
      person = new TestRelation(["id", "name", "age"])
      house = new TestRelation(["id"])
      

      environment = new knit.ReferenceEnvironment()
    })
    
    
    test("you can refer to nested attributes as strings and then resolve to real attributes at perform time. " +
         "the same thing happens to the attributes that are nested", function(){
      var peopleRef = environment.attr("people", environment.attr("person.id", "person.age"))
      
      assert.equal(peopleRef.name(), "people")
      assert.equal(knit.NullRelation, peopleRef.sourceRelation())
      peopleRef.setSourceRelation(house)
      assert.same(house, peopleRef.sourceRelation())
      
      environment.resolve({person:person, house:house})
      
      assert.equal(peopleRef.name(), "people")
      assert.same(house, peopleRef.sourceRelation())
      assert.arraySame(peopleRef.nestedRelation().attributes(), [person.attr("id"), person.attr("age")])
    })

    //what about nested attrs post-resolve?
      //it doesn't matter.  nested attrs aren't aware of whether their constituent attrs are "real" or not.
      //or rather, the attribute becomes real and then the parent attribute stops pointing at the unresolved reference

    test("inspect", function(){
      assert.equal("*people", environment.attr("people", environment.attr("person.id", "person.age")).inspect())
    })
    
      
    regarding("sameness and equivalence", function() {
    
      test("two unresolved references naming the same attribute are the same", function(){
        assert.same(environment.attr("people", environment.attr("person.id", "person.age")), 
                    environment.attr("people", environment.attr("person.id", "person.age")))
        assert.notSame(environment.attr("peopleZZ", environment.attr("person.id", "person.age")), 
                       environment.attr("people", environment.attr("person.id", "person.age")))
      })
      
      test("...in fact, it's the same object", function(){
        assert.equal(true, environment.attr("people", environment.attr("person.id", "person.age")) === 
                           environment.attr("people"))
      })
    
      test("two resolved references to the same attribute are the same(both ways)", function(){
        var peopleRef = environment.attr("people", environment.attr("person.id", "person.age"))
        peopleRef.setSourceRelation(environment.relation("house"))
        environment.resolve({person:person, house:house})
        
        assert.same(environment.attr("people").nestedRelation().attributes()[1], person.attr("age"))
        assert.same(person.attr("age"), environment.attr("people").nestedRelation().attributes()[1])
      })
      
      test("equivalent is like same", function(){
        assert.equivalent(environment.attr("people", environment.attr("person.id", "person.age")), 
                          environment.attr("people", environment.attr("person.id", "person.age")))
        assert.notEquivalent(environment.attr("people", environment.attr("person.id", "person.age")), 
                             environment.attr("peopleZZ", environment.attr("person.id", "person.age")))
      })
        
    })
  })
  
  regarding("relation and attribute referencing is resolved on the way out of a knit builder function", function() {
    test("relation refs are resolved on the way out according to the bindings set up", function(){      
      var $R = knit.createBuilderFunction({bindings:{person:person}})
      var personResult = $R(function(){
        var personRef = relation("person")
        assert.notSame(personRef, person)
        return personRef
      })
      assert.same(personResult, person)
    })

    test("attribute refs are resolved on the way out according to the bindings set up", function(){
      var $R = knit.createBuilderFunction({bindings:{person:person}})
      
      var ageResult = $R(function(){
        var ageRef = attr("person.age")
        assert.notSame(ageRef, person.attr("age"))
        return ageRef
      })
      assert.same(ageResult, person.attr("age"))
    })

    test("bindings can be a function", function(){
      var $R = knit.createBuilderFunction({bindings:function(){return {person:person}}})
      
      var personResult = $R(function(){return relation("person")})
      assert.same(personResult, person)
    })

    test("resolve within the builder function", function(){
      var $R = knit.createBuilderFunction({bindings:function(){return {person:person}}})
      
      var personResult = $R(function(){
        var personRef = relation("person")
        assert.notSame(personRef, this.outerPerson)
        resolve()
        assert.same(personRef, this.outerPerson)
        return personRef
      }, {outerPerson:person})
      
      assert.same(personResult, person)
      
    })

    test("resolve creates references to relations and attributes from bindings if they don't exist", function(){
      var $R = knit.createBuilderFunction({bindings:function(){return {person:person}}})
      
      $R(function(){
        resolve()
        assert.same(relation("person"), this.outerPerson)
        assert.same(attr("person.houseId"), this.outerPerson.attr("houseId"))
      }, {outerPerson:person})
        
    })
  })
  
})

