require("../test_helper.js")
require("knit/algebra/join")
require("knit/algebra/order")
require("./test_relation.js")

regarding("order", function() {
    
  beforeEach(function() {
    person = knit(function(){return testRelation(["id", "houseId", "name", "age"])})
  })

  test("inspect", function (){knit(function(){
    assert.equal("order.asc(r[id,houseId,name,age],name)", 
                 order.asc(person, person.attr("name")).inspect())
  })})

  
  regarding("sameness and equivalence", function() {
    
    test("same if the sort direction and sort attribute are equal", function (){knit(function(){
      assert.same(order.asc(person, person.attr("name")), order.asc(person, person.attr("name")))
      assert.notSame(order.asc(person, person.attr("name")), order.desc(person, person.attr("name")))
      assert.notSame(order.asc(person, person.attr("name")), order.asc(person, person.attr("age")))
    })})
        
    test("equivalent is like same", function (){knit(function(){
      assert.equivalent(order.asc(person, person.attr("name")), order.asc(person, person.attr("name")))
      assert.notEquivalent(order.asc(person, person.attr("name")), order.desc(person, person.attr("name")))
      assert.notEquivalent(order.asc(person, person.attr("name")), order.asc(person, person.attr("age")))
    })})
        
  })
  
})

