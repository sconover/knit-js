require("../test_helper.js")
require("knit/algebra/join")
require("knit/algebra/divide")
require("./../test_relation.js")

regarding("divide", function() {
    
  beforeEach(function() {
    this.$R = knit.createBuilderFunction({bindings:{
      person:new TestRelation(["id", "houseId", "name", "age"]),
      house:new TestRelation(["houseId", "address", "cityId"]),
      city:new TestRelation(["cityId", "name"])
    }})
  })
  
  test("the resulting relation has a-b attributes", function (){
    var join = this.$R(function(){return divide(join(relation("person"), relation("house")), relation("person"))})
    assert.equal(["houseId", "address", "cityId"], join.attributes().names())
  })
  
  test("inspect", function(){this.$R(function(){
    assert.equal("divide(join(*person,*house),*person)", 
                 divide(join(relation("person"), relation("house")), relation("person")).inspect())

  })})
  
  regarding("sameness and equivalence", function() {
    
    test("same", function(){this.$R(function(){
      assert.same(divide(relation("person"), relation("person")), divide(relation("person"), relation("person")))

      assert.notSame(divide(relation("person"), relation("person")), divide(relation("person"), relation("house")))
      assert.notSame(divide(relation("person"), relation("person")), divide(relation("house"), relation("person")))
    })})    

    test("same implies equivalent", function(){this.$R(function(){
      assert.equivalent(divide(relation("person"), relation("person")), divide(relation("person"), relation("person")))

      assert.notEquivalent(divide(relation("person"), relation("person")), divide(relation("person"), relation("house")))
      assert.notEquivalent(divide(relation("person"), relation("person")), divide(relation("house"), relation("person")))
    })})
  })
  
})

