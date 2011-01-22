require("./test_helper.js")
require("knit/reference")
require("./algebra/test_relation.js")

regarding("references allow late-binding of core relations and attributes. " +
          "and it allows knit to support situations where relations and attributes are brought into being late in runtime " +
          " - creation of nested attributes in nest, creating of new relations in normalize, etc.", function() {
    
  beforeEach(function() {
    person = new knit.TestRelationFunction(["id", "houseId", "name", "age"])
    
    env = {}
    knit.mixin.ReferenceEnvironment(env)
  })

  //simulate a real attribute
  //simulate a real relation
  //equality on the strings...
  //ref.perform says get the real one and then replace me
  
  //chain style...pass the env along..?  relations themselves have the attr/relation capability?
    //...yes!  everyone is a reference environment...what does that *mean*?
  
  //goal is to make multiple nesting / unnesting possible because of late binding.
    //then - make everything late?
  
  regarding("relation reference", function() {
  
    test("you can refer to relations as strings and then resolve to real relations at perform time", function(){
      var personRef = env.relation("personZ")
      assert.equal(false, personRef === person)
    
      var realPersonRelation = personRef.perform({personZ:person})
      assert.equal(true, realPersonRelation === person)
    })

    test("inspect", function(){
      assert.equal("personZ", env.relation("personZ").inspect())
    })

  
    regarding("sameness and equivalence", function() {
    
      test("same if the sort direction and sort attribute are equal", function(){knit(function(){
        assert.same(env.relation("person"), env.relation("person"))
        assert.notSame(env.relation("person"), env.relation("personZZZ"))
      })})
        
      test("equivalent is like same", function(){knit(function(){
        assert.equivalent(env.relation("person"), env.relation("person"))
        assert.notEquivalent(env.relation("person"), env.relation("personZZZ"))
      })})
        
    })
  })
  
})

