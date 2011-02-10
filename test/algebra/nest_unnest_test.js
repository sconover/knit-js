require("../test_helper.js")
require("knit/algebra/join")
require("knit/algebra/nest_unnest")
require("./../test_relation.js")

regarding("unnest", function() {
    
  beforeEach(function() {
    setupPersonHouseCity(this)
    this.house = new TestRelation([["houseId", knit.attributeType.Integer], 
                                   ["address", knit.attributeType.String], 
                                   {"people":this.person}])
    this.$R = knit.createBuilderFunction({bindings:{
      person:this.person,
      house:this.house
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
  
  })
  
})

regarding("nest", function() {
    
  beforeEach(function() { setupPersonHouseCity(this) })

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

