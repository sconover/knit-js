require("../helper")
require("knit/algebra/join")
require("knit/algebra/order")
require("./../test_relation.js")

regarding("order", function() {
    
  beforeEach(function(){ setupPersonHouseCity(this) })

  test("inspect", function(){this.$K(function(){
    assert.equal("order.asc(*person,*name)", 
                 order.asc(relation("person"), attr("person.name")).inspect())
  })})

  
  regarding("sameness and equivalence", function() {
    
    test("same if the sort direction and sort attribute are equal", function(){this.$K(function(){
      assert.same(order.asc(relation("person"), attr("person.name")), order.asc(relation("person"), attr("person.name")))
      assert.notSame(order.asc(relation("person"), attr("person.name")), order.desc(relation("person"), attr("person.name")))
      assert.notSame(order.asc(relation("person"), attr("person.name")), order.asc(relation("person"), attr("person.age")))
    })})
        
  })
  
})

