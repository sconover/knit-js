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
    assert.same(TRUE, TRUE)
    assert.notSame(TRUE, FALSE)
    assert.same(FALSE, FALSE)
    assert.notSame(FALSE, TRUE)

    assert.notSame(TRUE, 1)
    assert.notSame(FALSE, 1)
    
    assert.same(conjunction(TRUE, FALSE), conjunction(TRUE, FALSE))
    assert.notSame(conjunction(TRUE, FALSE), conjunction(TRUE, TRUE))
  })})  
  
  test("sameness - equality - uses primitives and attributes", function(){knit(function(){
    assert.notSame(FALSE, 1)
    assert.notSame(TRUE, 1)
    
    assert.same(equality(true, false), equality(true, false))
    assert.notSame(equality(true, false), equality(true, true))
    assert.same(equality(1, 1), equality(1, 1))
    assert.notSame(equality(1, 1), equality(1, 2))
    assert.same(equality("a", "a"), equality("a", "a"))
    assert.notSame(equality("a", "a"), equality("a", "ZZ"))
    
    var person = testRelation([
      ["id", knit.Attribute.IntegerType],
      ["house_id", knit.Attribute.IntegerType],
      ["name", knit.Attribute.StringType],
      ["age", knit.Attribute.IntegerType]
    ])
    
    assert.same(equality(person.attr("name"), true), equality(person.attr("name"), true))
    assert.same(equality(person.attr("name"), person.attr("age")), equality(person.attr("name"), person.attr("age")))

    assert.notSame(equality(person.attr("name"), true), equality(person.attr("name"), false))
    assert.notSame(equality(person.attr("name"), true), equality(true, true))
    assert.notSame(equality(person.attr("name"), person.attr("age")), equality(person.attr("name"), person.attr("house_id")))
  })})  
  
  
  test("shorthand", function(){knit(function(){
    assert.same(eq(true, false), equality(true, false))
    assert.same(and(TRUE, FALSE), conjunction(TRUE, FALSE))
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
    assert.equivalent(equality(1, 2), equality(2, 1))
    assert.notEquivalent(equality(1, 2), equality(2, 2))

    assert.equivalent(conjunction(TRUE, FALSE), conjunction(FALSE, TRUE))
    assert.notEquivalent(conjunction(TRUE, FALSE), conjunction(FALSE, FALSE))

    assert.equivalent(conjunction(conjunction(TRUE, TRUE), FALSE), conjunction(FALSE, conjunction(TRUE, TRUE)))
    assert.notEquivalent(conjunction(conjunction(TRUE, TRUE), FALSE), conjunction(TRUE, conjunction(TRUE, TRUE)))

    var person = testRelation([
      ["id", knit.Attribute.IntegerType],
      ["house_id", knit.Attribute.IntegerType],
      ["name", knit.Attribute.StringType],
      ["age", knit.Attribute.IntegerType]
    ])

    assert.equivalent(equality(person.attr("name"), 2), equality(2, person.attr("name")))
    assert.equivalent(equality(person.attr("name"), person.attr("age")), equality(person.attr("age"), person.attr("name")))
    assert.notEquivalent(equality(person.attr("name"), 2), equality(2, person.attr("age")))
  })})
  
  test("associativity - nested equivalence", function(){knit(function(){
    assert.equivalent(conjunction(equality(1, 2), FALSE), conjunction(FALSE, equality(1, 2)))
    assert.notEquivalent(conjunction(equality(1, 2), FALSE), conjunction(TRUE, equality(2, 2)))
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

