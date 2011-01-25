require("../test_helper.js")
require("knit/algebra/join")
require("knit/algebra/nest_unnest")
require("./test_relation.js")

regarding("unnest", function() {
    
  beforeEach(function() {
    this.$R = knit.createBuilderFunction({bindings:{
      person:new TestRelation(["personId", "houseId", "name", "age"]),
      house:new TestRelation(["houseId", "address", {"people":new TestRelation(["personId", "houseId", "name", "age"])}])
    }})
  })

  test("inspect", function(){this.$R(function(){
    assert.equal("unnest(*house,*people)", 
                 unnest(relation("house"), attr("house.people")).inspect())
  })})

  
  regarding("sameness and equivalence", function() {
    
    test("same", function(){this.$R(function(){
      assert.same(unnest(relation("house"), attr("house.people")), unnest(relation("house"), attr("house.people")))
      assert.notSame(unnest(relation("house"), attr("house.people")), unnest(relation("house"), attr("house.address")))
    })})    
  
    test("equivalence and sameness are the same thing", function(){this.$R(function(){
      assert.equivalent(unnest(relation("house"), attr("house.people")), unnest(relation("house"), attr("house.people")))
      assert.notEquivalent(unnest(relation("house"), attr("house.people")), unnest(relation("house"), attr("house.address")))
    })})    
  })
  
})

regarding("nest", function() {
    
  beforeEach(function() {
    this.$R = knit.createBuilderFunction({bindings:{
      person:new TestRelation(["personId", "name", "age"]),
      house:new TestRelation(["houseId", "address"])
    }})
  })

  test("inspect", function(){this.$R(function(){
    var houseAndPerson = join(relation("house"), relation("person"))
    assert.equal("nest(join(*house,*person),*people)", 
                 nest(houseAndPerson, attr("people", attr("person.personId", "person.name", "person.age")) ).inspect())
  })})

  
  xregarding("sameness and equivalence", function() {
    
    test("same", function(){this.$R(function(){      
      assert.same(nest(relation("house"), attr("houseIds", [attr("house.houseId")])), nest(relation("house"), attr("houseIds", [attr("house.houseId")])))
      assert.notSame(nest(relation("house"), attr("houseIds", [attr("house.houseId")])), nest(relation("house"), attr("addresses", [attr("house.addresses")])))
    })})    
  
    test("equivalence and sameness are the same thing", function(){this.$R(function(){
      assert.equivalent(nest(relation("house"), attr("houseIds", [attr("house.houseId")])), nest(relation("house"), attr("houseIds", [attr("house.houseId")])))
      assert.notEquivalent(nest(relation("house"), attr("houseIds", [attr("house.houseId")])), nest(relation("house"), attr("addresses", [attr("house.addresses")])))
    })})    
  })
  
})

