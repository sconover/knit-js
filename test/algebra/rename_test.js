require("../helper")
require("knit/algebra/rename")
require("./../test_relation.js")

regarding("rename", function() {
    
  beforeEach(function(){ setupPersonHouseCity(this) })

  test("inspect", function(){this.$K(function(){
    assert.equal("rename(*person,martian)", 
                 rename(relation("person"), "martian").inspect())

    assert.equal("#oldness", 
                 rename(attr("person.age"), "oldness").inspect())
  })})

  // test("you can rename a relation", function(){this.$K(function(){
  //   assert.equal("martian", rename(relation("person"), "martian").name())
  // })})

  test("you can rename an attribute", function(){this.$K(function(){
    assert.equal("oldness", rename(attr("person.age"), "oldness").name())
  })})

  test("renamed relations and attributes keep type", function(){this.$K(function(){   
    assert.quacksLike(rename(relation("person"), "martian"), knit.signature.relation)
    assert.quacksLike(rename(attr("person.age"), "oldness"), knit.signature.attribute)
  })})


  
  regarding("rename relation: sameness and equivalence", function() {
    
    test("same if rename name and the relation are equal", function(){this.$K(function(){
      assert.same(rename(relation("person"), "martian"), rename(relation("person"), "martian"))
      assert.notSame(rename(relation("person"), "martian"), rename(relation("person"), "zoozoo"))
      assert.notSame(rename(relation("person"), "martian"), rename(relation("horse"), "martian"))
    })})
        
  })
  
  regarding("rename attribute: sameness and equivalence", function() {
    
    test("same if rename name and the attribute are equal", function(){this.$K(function(){
      assert.same(rename(attr("person.age"), "oldness"), rename(attr("person.age"), "oldness"))
      assert.notSame(rename(attr("person.age"), "oldness"), rename(attr("person.age"), "grumpiness"))
      assert.notSame(rename(attr("person.age"), "oldness"), rename(attr("person.name"), "oldness"))
    })})
        
  })
  
})

