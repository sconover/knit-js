require("../test_helper.js")
require("knit/algebra/predicate")
require("knit/algebra/join")
require("./../test_relation.js")

regarding("predicates", function() {

  beforeEach(function() {
    var person = new TestRelation(["id", "houseId", "name", "age"])
    this.person = person
    this.$R = knit.createBuilderFunction({bindings:{
      person:person,
      house:new TestRelation(["houseId", "address", "cityId"]),
      city:new TestRelation(["cityId", "name"])
    }})
  })

  
  test("sameness", function(){this.$R(function(){
    assert.same(TRUE, TRUE)
    assert.notSame(TRUE, FALSE)
    assert.same(FALSE, FALSE)
    assert.notSame(FALSE, TRUE)

    assert.notSame(TRUE, 99)
    assert.notSame(FALSE, 99)
    
    assert.same(conjunction(TRUE, FALSE), conjunction(TRUE, FALSE))
    assert.notSame(conjunction(TRUE, FALSE), conjunction(TRUE, TRUE))
  })})  
  
  test("sameness - equality - uses primitives and attributes", function(){this.$R(function(){
    assert.notSame(FALSE, 1)
    assert.notSame(TRUE, 1)
    
    assert.same(equality(true, false), equality(true, false))
    assert.notSame(equality(true, false), equality(true, true))
    assert.same(equality(1, 1), equality(1, 1))
    assert.notSame(equality(1, 1), equality(1, 2))
    assert.same(equality("a", "a"), equality("a", "a"))
    assert.notSame(equality("a", "a"), equality("a", "ZZ"))
    
    assert.same(equality(attr("person.name"), true), equality(attr("person.name"), true))
    assert.same(equality(attr("person.name"), attr("person.age")), equality(attr("person.name"), attr("person.age")))
    
    assert.same(equality(this.person.attr("name"), true), equality(this.person.attr("name"), true))

    assert.notSame(equality(attr("person.name"), true), equality(attr("person.name"), false))
    assert.notSame(equality(attr("person.name"), true), equality(true, true))
    assert.notSame(equality(attr("person.name"), attr("person.age")), equality(attr("person.name"), attr("person.houseId")))
  }, this)})  
  
  
  test("shorthand", function(){this.$R(function(){
    assert.same(eq(true, false), equality(true, false))
    assert.same(and(TRUE, FALSE), conjunction(TRUE, FALSE))
  })})  

  test("inspect", function(){this.$R(function(){
    assert.equal("eq(1,1)", TRUE.inspect())
    assert.equal("eq(1,2)", FALSE.inspect())
    
    assert.equal("eq(true,false)", equality(true, false).inspect())
    assert.equal("eq(1,2)", equality(1, 2).inspect())
    assert.equal("eq('a','b')", equality("a", "b").inspect())
    
    assert.equal("and(eq(1,1),eq(1,2))", conjunction(TRUE, FALSE).inspect())
  })})  
    
  test("associativity - order doesn't matter", function(){this.$R(function(){
    assert.equivalent(equality(1, 2), equality(2, 1))
    assert.notEquivalent(equality(1, 2), equality(2, 2))

    assert.equivalent(conjunction(TRUE, FALSE), conjunction(FALSE, TRUE))
    assert.notEquivalent(conjunction(TRUE, FALSE), conjunction(FALSE, FALSE))

    assert.equivalent(conjunction(conjunction(TRUE, TRUE), FALSE), conjunction(FALSE, conjunction(TRUE, TRUE)))
    assert.notEquivalent(conjunction(conjunction(TRUE, TRUE), FALSE), conjunction(TRUE, conjunction(TRUE, TRUE)))

    assert.equivalent(equality(attr("person.name"), 2), equality(2, attr("person.name")))
    assert.equivalent(equality(attr("person.name"), attr("person.age")), equality(attr("person.age"), attr("person.name")))
    assert.notEquivalent(equality(attr("person.name"), 2), equality(2, attr("person.age")))
  })})
  
  test("associativity - nested equivalence", function(){this.$R(function(){
    assert.equivalent(conjunction(equality(1, 2), FALSE), conjunction(FALSE, equality(1, 2)))
    assert.notEquivalent(conjunction(equality(1, 2), FALSE), conjunction(TRUE, equality(2, 2)))
  })})  
  
  test("determine whether a predicate is concerned with a particular relation (and no others).  " +
       "that means all attributes are of that relation, and otherwise there are primitives", function(){this.$R(function(){
    resolve()
    assert.equal(true, equality(1, 2).concernedWithNoOtherRelationsBesides(relation("person")))
    assert.equal(true, equality(1, 2).concernedWithNoOtherRelationsBesides(relation("house")))
    
    assert.equal(true, equality(attr("person.age"), 55).concernedWithNoOtherRelationsBesides(relation("person")))
    assert.equal(true, equality(55, attr("person.age")).concernedWithNoOtherRelationsBesides(relation("person")))
    assert.equal(true, equality(attr("person.age"), attr("person.name")).concernedWithNoOtherRelationsBesides(relation("person")))
    assert.equal(true, equality(attr("house.address"), "123 Main").concernedWithNoOtherRelationsBesides(relation("house")))
    
    assert.equal(false, equality(attr("house.address"), "123 Main").concernedWithNoOtherRelationsBesides(relation("person")))
    assert.equal(false, equality(attr("person.age"), 55).concernedWithNoOtherRelationsBesides(relation("house")))
    assert.equal(false, equality(55, attr("person.age")).concernedWithNoOtherRelationsBesides(relation("house")))
    
    assert.equal(false, equality(attr("person.age"), attr("house.address")).concernedWithNoOtherRelationsBesides(relation("person")))
    
    assert.equal(true, conjunction(TRUE, FALSE).concernedWithNoOtherRelationsBesides(relation("person")))
    
    assert.equal(true, conjunction(equality(attr("person.age"), 55), 
                                   equality(attr("person.name"), "Emily")).concernedWithNoOtherRelationsBesides(relation("person")))
    
    assert.equal(false, conjunction(equality(attr("person.age"), 55), 
                                    equality(attr("house.address"), "123 Main")).concernedWithNoOtherRelationsBesides(relation("person")))
    
  })})
  
  test("concerned with no other relation ... works with compound relations", function(){this.$R(function(){
    resolve()
    assert.equal(true, equality(attr("person.age"), 55).concernedWithNoOtherRelationsBesides(join(relation("person"), relation("house"))))
    assert.equal(true, conjunction(equality(attr("person.age"), 55), equality(attr("house.address"), "123 Main")).
                         concernedWithNoOtherRelationsBesides(join(relation("person"), relation("house"))))
    
    assert.equal(false, equality(attr("person.age"), 55).concernedWithNoOtherRelationsBesides(join(relation("house"), relation("city"))))
    assert.equal(false, conjunction(equality(attr("person.age"), 55), equality(attr("house.address"), "123 Main")).
                          concernedWithNoOtherRelationsBesides(join(relation("house"), relation("city"))))
  })})

  test("only concerned with...more than one relation", function(){this.$R(function(){
    resolve()
    assert.equal(true, equality(attr("person.age"), 55).concernedWithNoOtherRelationsBesides(relation("person"), relation("house")))
    assert.equal(true, equality(attr("person.age"), attr("house.address")).concernedWithNoOtherRelationsBesides(relation("person"), relation("house")))
    
    assert.equal(false, conjunction(equality(attr("person.age"), attr("house.address")), equality(attr("city.cityId"), 1)).
                         concernedWithNoOtherRelationsBesides(relation("person"), relation("house")))
  })})

  test("concerned with all of - somewhere in the predicate we're concerned with the relation(s)", function(){this.$R(function(){
    resolve()
    assert.equal(true, equality(attr("person.age"), 55).concernedWithAllOf(relation("person")))
    assert.equal(true, equality(attr("person.age"), attr("house.address")).concernedWithAllOf(relation("person")))
    assert.equal(true, conjunction(equality(attr("person.age"), attr("house.address")), 
                                   equality(attr("city.cityId"), 1)).
                         concernedWithAllOf(relation("person"), relation("house")))
    assert.equal(true, conjunction(equality(attr("person.age"), attr("house.address")), equality(attr("city.cityId"), 1)).
                         concernedWithAllOf(relation("person"), relation("house"), relation("city")))
                        
    assert.equal(false, equality(attr("person.age"), 55).concernedWithAllOf(relation("person"), relation("house")))
  })})
})

