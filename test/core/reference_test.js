require("../helper")
require("knit/core")
require("knit/algebra/rename")
require("../test_relation.js")

regarding("references allow late-binding of core relations and attributes. " +
          "and it allows knit to support situations where relations and attributes are brought into being late in runtime " +
          " - creation of nested attributes in nest, creating of new relations in normalize, etc.", function() {
    
  beforeEach(function() {
    setupPersonHouseCity(this)
    this.environment = new knit.ReferenceEnvironment()
  })


  regarding("relation reference", function() {

    regarding("sameness and equivalence", function() {
  
      test("two unresolved references naming the same relation are the same", function(){
        assert.same(this.environment.relation("person"), this.environment.relation("person"))
        assert.notSame(this.environment.relation("person"), this.environment.relation("personZZZ"))
        assert.notSame(this.environment.relation("person"), this.person)
      })
      
      test("...in fact, it's the same object", function(){
        assert.equal(true, this.environment.relation("person") === this.environment.relation("person"))
      })
      
      test("two resolved references to the same relation are the same (both ways)", function(){
        this.environment.relation("person")
        this.environment.resolve({person:this.person})
        assert.same(this.environment.relation("person"), this.person)
        assert.same(this.person, this.environment.relation("person"))
        assert.same(this.environment.relation("person"), this.environment.relation("person"))
      })
      
    })
    
    regarding("resolving a reference to a real relation", function() {
      test("you can refer to relations as strings, then the this.environment swaps the string out for the real thing.", function(){
        var personRef = this.environment.relation("personZ")
        assert.notSame(personRef, this.person)
      
        this.environment.resolve({personZ:this.person})
        assert.same(personRef, this.person)
      })
    })
      
    test("inspect", function(){
      assert.equal("*personZ", this.environment.relation("personZ").inspect())
    })
  
  })
  
  regarding("attribute reference", function() {
  
    test("you can refer to attributes as strings and then resolve to real attributes at compile time", function(){
      var ageRef = this.environment.attr("personZ.age")
      assert.notSame(ageRef, this.person.attr("age")) //attr method naming collision coming...
      
      this.environment.resolve({personZ:this.person})
      assert.same(ageRef, this.person.attr("age"))
    })

    test("inspect", function(){
      assert.equal("*age", this.environment.attr("personZ.age").inspect())
    })

  
    regarding("sameness and equivalence", function() {
    
      test("two unresolved references naming the same attribute are the same", function(){
        assert.same(this.environment.attr("person.age"), this.environment.attr("person.age"))
        assert.notSame(this.environment.attr("person.age"), this.environment.attr("personZZZ.age"))
        assert.notSame(this.environment.attr("person.age"), this.environment.attr("person.ageZZZ"))
      })
      
      test("...in fact, it's the same object", function(){
        assert.equal(true, this.environment.attr("person.age") === this.environment.attr("person.age"))
      })

      test("two resolved references to the same attribute are the same(both ways)", function(){
        this.environment.attr("person.age")
        this.environment.resolve({person:this.person})
        
        assert.same(this.environment.attr("person.age"), this.person.attr("age"))
        assert.same(this.person.attr("age"), this.environment.attr("person.age"))
        assert.same(this.environment.attr("person.age"), this.environment.attr("person.age"))
      })
      
    })
  })
  
  regarding("nested attribute reference", function() {
    
    beforeEach(function(){ 
      setupPersonHouseCity(this) 
      this.environment = new knit.ReferenceEnvironment()
    })
    
    test("you can refer to nested attributes as strings and then resolve to real attributes at compile time. " +
         "the same thing happens to the attributes that are nested", function(){
      var peopleRef = this.environment.attr("people", this.environment.attr("person.personId", "person.age"))
      
      assert.equal(peopleRef.name(), "people")
      assert.equal(knit.NullRelation, peopleRef.sourceRelation())
      peopleRef.setSourceRelation(this.house)
      assert.same(this.house, peopleRef.sourceRelation())
      
      this.environment.resolve({person:this.person, house:this.house})
      
      assert.equal(peopleRef.name(), "people")
      assert.same(this.house, peopleRef.sourceRelation())
      assert.deepSame(peopleRef.nestedRelation().attributes(), [this.person.attr("personId"), this.person.attr("age")])
    })

    //what about nested attrs post-resolve?
      //it doesn't matter.  nested attrs aren't aware of whether their constituent attrs are "real" or not.
      //or rather, the attribute becomes real and then the parent attribute stops pointing at the unresolved reference

    test("inspect", function(){
      assert.equal("*people", this.environment.attr("people", this.environment.attr("person.personId", "person.age")).inspect())
    })
    
      
    regarding("sameness and equivalence", function() {
    
      test("two unresolved references naming the same attribute are the same", function(){
        assert.same(this.environment.attr("people", this.environment.attr("person.personId", "person.age")), 
                    this.environment.attr("people", this.environment.attr("person.personId", "person.age")))
        assert.notSame(this.environment.attr("peopleZZ", this.environment.attr("person.personId", "person.age")), 
                       this.environment.attr("people", this.environment.attr("person.personId", "person.age")))
      })
      
      test("...in fact, it's the same object", function(){
        assert.equal(true, this.environment.attr("people", this.environment.attr("person.personId", "person.age")) === 
                           this.environment.attr("people"))
      })
    
      test("two resolved references to the same attribute are the same(both ways)", function(){
        var peopleRef = this.environment.attr("people", this.environment.attr("person.personId", "person.age"))
        peopleRef.setSourceRelation(this.environment.relation("house"))
        this.environment.resolve({person:this.person, house:this.house})
        
        assert.same(this.environment.attr("people").nestedRelation().attributes()[1], this.person.attr("age"))
        assert.same(this.person.attr("age"), this.environment.attr("people").nestedRelation().attributes()[1])
      })
      
    })
  })
  
  regarding("relation and attribute referencing is resolved on the way out of a knit builder function", function() {
    test("relation refs are resolved on the way out according to the bindings set up", function(){      
      var $R = knit.createBuilderFunction({bindings:{person:this.person}})
      var personResult = $R(function(){
        var personRef = relation("person")
        assert.notSame(personRef, this.person)
        return personRef
      }, this)
      assert.same(personResult, this.person)
    })

    test("attribute refs are resolved on the way out according to the bindings set up", function(){
      var $R = knit.createBuilderFunction({bindings:{person:this.person}})
      
      var ageResult = $R(function(){
        var ageRef = attr("person.age")
        assert.notSame(ageRef, this.person.attr("age"))
        return ageRef
      }, this)
      assert.same(ageResult, this.person.attr("age"))
    })

    test("bindings can be a function", function(){
      var $R = knit.createBuilderFunction({bindings:{person:this.person}})
      
      var personResult = $R(function(){return relation("person")})
      assert.same(personResult, this.person)
    })

    test("resolve within the builder function", function(){
      var $R = knit.createBuilderFunction({bindings:{person:this.person}})
      
      var personResult = $R(function(){
        var personRef = relation("person")
        assert.notSame(personRef, this.outerPerson)
        resolve()
        assert.same(personRef, this.outerPerson)
        return personRef
      }, {outerPerson:this.person})
      
      assert.same(personResult, this.person)
      
    })

    test("resolve creates references to relations and attributes from bindings if they don't exist", function(){
      var $R = knit.createBuilderFunction({bindings:{person:this.person}})
      
      $R(function(){
        resolve()
        assert.same(relation("person"), this.outerPerson)
        assert.same(attr("person.houseId"), this.outerPerson.attr("houseId"))
      }, {outerPerson:this.person})        
    })
    
    test("relation renames register themselves with the environment.  references to renames are replaced with the renamed relations", function(){
      var $R = knit.createBuilderFunction({bindings:{person:this.person}})
      
      var martian = $R(function(){
        rename(relation("person"), "martian")
        return relation("martian")
      }, {person:this.person})        
      
      assert.same(martian, new knit.algebra.RenameRelation(this.person, "martian"))
    })
    
    test("attribute renames register themselves with the environment.  references to renames are replaced with the renamed attributes", function(){
      var $R = knit.createBuilderFunction({bindings:{person:this.person}})
      
      var oldness = $R(function(){
        rename(attr("person.age"), "oldness")
        return attr("oldness")
      }, {person:this.person})        

      assert.same(oldness, new knit.algebra.RenameAttribute(this.person.attr("age"), "oldness"))
    })
    
    
  })
  
})

