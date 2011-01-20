require("../test_helper.js")
require("knit/algebra/join")
require("knit/algebra/nest_unnest")
require("./test_relation.js")

regarding("unnest", function() {
    
  beforeEach(function() {
    person = knit(function(){return testRelation(["personId", "name", "age"])})
    house = knit(function(){return testRelation(["houseId", "address", {"people":person}])})
  })

  test("inspect", function(){knit(function(){
    assert.equal("unnest(r[houseId,address,people:r[personId,name,age]],people:r[personId,name,age])", 
                 unnest(house, house.attr("people")).inspect())
  })})

  
  regarding("sameness and equivalence", function() {
    
    test("same", function(){knit(function(){
      assert.same(unnest(house, house.attr("people")), unnest(house, house.attr("people")))
      assert.notSame(unnest(house, house.attr("people")), unnest(house, house.attr("address")))
    })})    
  
    test("equivalence and sameness are the same thing", function(){knit(function(){
      assert.equivalent(unnest(house, house.attr("people")), unnest(house, house.attr("people")))
      assert.notEquivalent(unnest(house, house.attr("people")), unnest(house, house.attr("address")))
    })})    
  })
  
})

regarding("nest", function() {
    
  beforeEach(function() {
    person = knit(function(){return testRelation(["personId", "name", "age"])})
    house = knit(function(){return testRelation(["houseId", "address"])})
    houseAndPerson = knit(function(){return join(house, person)})
  })

  test("inspect", function(){knit(function(){
    assert.equal("nest(join(r[houseId,address],r[personId,name,age]),people:r[personId,name,age])", 
                 nest(houseAndPerson, {"people":[person.attr("personId"), person.attr("name"), person.attr("age")]} ).inspect())
  })})

  
  regarding("sameness and equivalence", function() {
    
    test("same", function(){knit(function(){
      assert.same(nest(house, {"houseIds":[house.attr("houseId")]}), nest(house, {"houseIds":[house.attr("houseId")]}))
      assert.notSame(nest(house, {"houseIds":[house.attr("houseId")]}), nest(house, {"addresses":[house.attr("address")]}))
    })})    
  
    test("equivalence and sameness are the same thing", function(){knit(function(){
      assert.equivalent(nest(house, {"houseIds":[house.attr("houseId")]}), nest(house, {"houseIds":[house.attr("houseId")]}))
      assert.notEquivalent(nest(house, {"houseIds":[house.attr("houseId")]}), nest(house, {"addresses":[house.attr("address")]}))
    })})    
  })
  
})

