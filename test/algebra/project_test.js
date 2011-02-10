require("../test_helper.js")
require("knit/algebra/project")
require("./../test_relation.js")

regarding("project lets you cut down the columns in a relation", function() {
    
  beforeEach(function(){ setupPersonHouseCity(this) })

  test("inspect", function(){this.$R(function(){
    assert.equal("project(*person,[*name,*age])", 
                 project(relation("person"), attr("person.name", "person.age")).inspect())
  })})

  
  regarding("sameness and equivalence", function() {
    
    test("same if the relation and project attributes are equal", function(){this.$R(function(){
      assert.same(project(relation("person"), attr("person.name", "person.age")), project(relation("person"), attr("person.name", "person.age")))
      assert.notSame(project(relation("person"), attr("person.name"), attr("person.age")), project(relation("person"), [attr("person.name")]))
      assert.notSame(project(relation("person"), [attr("person.personId")]), project(relation("house"), [attr("house.houseId")]))
    })})
        
    test("equivalent is like same", function(){this.$R(function(){
      assert.equivalent(project(relation("person"), attr("person.name", "person.age")), project(relation("person"), attr("person.name", "person.age")))
      assert.notEquivalent(project(relation("person"), attr("person.name", "person.age")), project(relation("person"), [attr("person.name")]))
      assert.notEquivalent(project(relation("person"), [attr("person.personId")]), project(relation("house"), [attr("house.houseId")]))
    })})
        
  })
  
})

