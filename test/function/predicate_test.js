require("../test_helper.js")
require("knit/function/predicate")
require("knit/function/join")
require("./test_relation.js")

regarding("predicates", function() {

  beforeEach(function() {
    person = knit(function(){return testRelation([
      ["id", knit.Attribute.IntegerType],
      ["house_id", knit.Attribute.IntegerType],
      ["name", knit.Attribute.StringType],
      ["age", knit.Attribute.IntegerType]
    ])})
    
    house = knit(function(){return testRelation([
      ["house_id", knit.Attribute.IntegerType],
      ["address", knit.Attribute.StringType],
      ["city_id", knit.Attribute.IntegerType]
    ])})
    
    city = knit(function(){return testRelation([
      ["city_id", knit.Attribute.IntegerType],
      ["name", knit.Attribute.StringType]
    ])})
  })

  
  test("sameness", function(){knit(function(){
    assert.equal(true, TRUE.isSame(TRUE))
    assert.equal(false, TRUE.isSame(FALSE))
    assert.equal(true, FALSE.isSame(FALSE))
    assert.equal(false, FALSE.isSame(TRUE))

    assert.equal(false, TRUE.isSame(1))
    assert.equal(false, FALSE.isSame(1))
    
    assert.equal(true, conjunction(TRUE, FALSE).isSame(conjunction(TRUE, FALSE)))
    assert.equal(false, conjunction(TRUE, FALSE).isSame(conjunction(TRUE, TRUE)))
  })})  
  
  test("sameness - equality - uses primitives and attributes", function(){knit(function(){
    assert.equal(false, FALSE.isSame(1))
    assert.equal(false, TRUE.isSame(1))
    
    assert.equal(true, equality(true, false).isSame(equality(true, false)))
    assert.equal(false, equality(true, false).isSame(equality(true, true)))
    assert.equal(true, equality(1, 1).isSame(equality(1, 1)))
    assert.equal(false, equality(1, 1).isSame(equality(1, 2)))
    assert.equal(true, equality("a", "a").isSame(equality("a", "a")))
    assert.equal(false, equality("a", "a").isSame(equality("a", "ZZ")))    
    
    var person = testRelation([
      ["id", knit.Attribute.IntegerType],
      ["house_id", knit.Attribute.IntegerType],
      ["name", knit.Attribute.StringType],
      ["age", knit.Attribute.IntegerType]
    ])
    
    assert.equal(true, equality(person.attr("name"), true).isSame(equality(person.attr("name"), true)))
    assert.equal(true, equality(person.attr("name"), person.attr("age")).
                         isSame(equality(person.attr("name"), person.attr("age"))))

    assert.equal(false, equality(person.attr("name"), true).
                          isSame(equality(person.attr("name"), false)))
    assert.equal(false, equality(person.attr("name"), true).
                          isSame(equality(true, true)))
    assert.equal(false, equality(person.attr("name"), person.attr("age")).
                          isSame(equality(person.attr("name"), person.attr("house_id"))))
  })})  
  
  
  test("shorthand", function(){knit(function(){
    assert.equal(true, eq(true, false).isSame(equality(true, false)))
        
    assert.equal(true, and(TRUE, FALSE).isSame(conjunction(TRUE, FALSE)))
  })})  

  test("inspect", function(){knit(function(){
    assert.equal("eq(1,1)", TRUE.inspect())
    assert.equal("eq(1,2)", FALSE.inspect())
    
    assert.equal("eq(true,false)", equality(true, false).inspect())
    assert.equal("eq(1,2)", equality(1, 2).inspect())
    assert.equal("eq('a','b')", equality("a", "b").inspect())
    
    assert.equal("and(eq(1,1),eq(1,2))", conjunction(TRUE, FALSE).inspect())
  })})  
    
  test("associativity - order doesn't matter", function(){knit(function(){
    assert.equal(true, equality(1, 2).isEquivalent(equality(2, 1)))
    assert.equal(false, equality(1, 2).isEquivalent(equality(2, 2)))

    assert.equal(true, conjunction(TRUE, FALSE).isEquivalent(conjunction(FALSE, TRUE)))
    assert.equal(false, conjunction(TRUE, FALSE).isEquivalent(conjunction(FALSE, FALSE)))

    assert.equal(true, conjunction(conjunction(TRUE, TRUE), FALSE).
                        isEquivalent(conjunction(FALSE, conjunction(TRUE, TRUE))))
    assert.equal(false, conjunction(conjunction(TRUE, TRUE), FALSE).
                        isEquivalent(conjunction(TRUE, conjunction(TRUE, TRUE))))

    var person = testRelation([
      ["id", knit.Attribute.IntegerType],
      ["house_id", knit.Attribute.IntegerType],
      ["name", knit.Attribute.StringType],
      ["age", knit.Attribute.IntegerType]
    ])

    assert.equal(true, equality(person.attr("name"), 2).isEquivalent(equality(2, person.attr("name"))))
    assert.equal(true, equality(person.attr("name"), person.attr("age")).isEquivalent(equality(person.attr("age"), person.attr("name"))))
    assert.equal(false, equality(person.attr("name"), 2).isEquivalent(equality(2, person.attr("age"))))

  })})
  
  test("associativity - nested equivalence", function(){knit(function(){
    assert.equal(true, conjunction(equality(1, 2), FALSE).
                        isEquivalent(conjunction(FALSE, equality(1, 2))))
    assert.equal(false, conjunction(equality(1, 2), FALSE).
                        isEquivalent(conjunction(TRUE, equality(2, 2))))
  })})  
  
  test("a predicate may be only concerned with a relation.  that means all attributes are of that relation, and otherwise there are primitives", function(){knit(function(){

    assert.equal(true, equality(1, 2).concernedWithNoOtherRelationsBesides(person))
    assert.equal(true, equality(1, 2).concernedWithNoOtherRelationsBesides(house))
    
    assert.equal(true, equality(person.attr("age"), 55).concernedWithNoOtherRelationsBesides(person))
    assert.equal(true, equality(55, person.attr("age")).concernedWithNoOtherRelationsBesides(person))
    assert.equal(true, equality(person.attr("age"), person.attr("name")).concernedWithNoOtherRelationsBesides(person))
    assert.equal(true, equality(house.attr("address"), "123 Main").concernedWithNoOtherRelationsBesides(house))
    
    assert.equal(false, equality(house.attr("address"), "123 Main").concernedWithNoOtherRelationsBesides(person))
    assert.equal(false, equality(person.attr("age"), 55).concernedWithNoOtherRelationsBesides(house))
    assert.equal(false, equality(55, person.attr("age")).concernedWithNoOtherRelationsBesides(house))
    
    assert.equal(false, equality(person.attr("age"), house.attr("address")).concernedWithNoOtherRelationsBesides(person))
    
    assert.equal(true, conjunction(TRUE, FALSE).concernedWithNoOtherRelationsBesides(person))
    
    assert.equal(true, conjunction(equality(person.attr("age"), 55), 
                                   equality(person.attr("name"), "Emily")).concernedWithNoOtherRelationsBesides(person))
    
    assert.equal(false, conjunction(equality(person.attr("age"), 55), 
                                    equality(house.attr("address"), "123 Main")).concernedWithNoOtherRelationsBesides(person))
    
  })})
  
  test("concerned with no other relation ... works with compound relations", function(){knit(function(){
	  assert.equal(true, equality(person.attr("age"), 55).concernedWithNoOtherRelationsBesides(join(person, house)))
	  assert.equal(true, conjunction(equality(person.attr("age"), 55), equality(house.attr("address"), "123 Main")).
	                       concernedWithNoOtherRelationsBesides(join(person, house)))
	  
	  assert.equal(false, equality(person.attr("age"), 55).concernedWithNoOtherRelationsBesides(join(house, city)))
	  assert.equal(false, conjunction(equality(person.attr("age"), 55), equality(house.attr("address"), "123 Main")).
	                        concernedWithNoOtherRelationsBesides(join(house, city)))
  })})

  test("only concerned with...more than one relation", function(){knit(function(){
		assert.equal(true, equality(person.attr("age"), 55).concernedWithNoOtherRelationsBesides(person, house))
		assert.equal(true, equality(person.attr("age"), house.attr("address")).concernedWithNoOtherRelationsBesides(person, house))
		
		assert.equal(false, conjunction(equality(person.attr("age"), house.attr("address")), equality(city.attr("city_id"), 1)).
												 concernedWithNoOtherRelationsBesides(person, house))
  })})

  test("concerned with all of - somewhere in the predicate we're concerned with the relation(s)", function(){knit(function(){
		assert.equal(true, equality(person.attr("age"), 55).concernedWithAllOf(person))
		assert.equal(true, equality(person.attr("age"), house.attr("address")).concernedWithAllOf(person))
		assert.equal(true, conjunction(equality(person.attr("age"), house.attr("address")), 
																   equality(city.attr("city_id"), 1)).
												 concernedWithAllOf(person, house))
		assert.equal(true, conjunction(equality(person.attr("age"), house.attr("address")), equality(city.attr("city_id"), 1)).
												 concernedWithAllOf(person, house, city))
												
		assert.equal(false, equality(person.attr("age"), 55).concernedWithAllOf(person, house))
  })})
})

