require("../test_helper.js")
require("knit/algebra/join")
require("knit/algebra/order")
require("./../test_relation.js")

regarding("order", function() {
    
  beforeEach(function(){ setupPersonHouseCity(this) })

  test("inspect", function(){this.$R(function(){
    assert.equal("order.asc(*person,*name)", 
                 order.asc(relation("person"), attr("person.name")).inspect())
  })})

  
  regarding("sameness and equivalence", function() {
    
    test("same if the sort direction and sort attribute are equal", function(){this.$R(function(){
      assert.same(order.asc(relation("person"), attr("person.name")), order.asc(relation("person"), attr("person.name")))
      assert.notSame(order.asc(relation("person"), attr("person.name")), order.desc(relation("person"), attr("person.name")))
      assert.notSame(order.asc(relation("person"), attr("person.name")), order.asc(relation("person"), attr("person.age")))
    })})
        
    test("equivalent is like same", function(){this.$R(function(){
      assert.equivalent(order.asc(relation("person"), attr("person.name")), order.asc(relation("person"), attr("person.name")))
      assert.notEquivalent(order.asc(relation("person"), attr("person.name")), order.desc(relation("person"), attr("person.name")))
      assert.notEquivalent(order.asc(relation("person"), attr("person.name")), order.asc(relation("person"), attr("person.age")))
    })})
        
  })
  
})

