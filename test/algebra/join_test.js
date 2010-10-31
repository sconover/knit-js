require("../test_helper.js")
require("knit/algebra/join")
require("./test_relation.js")

regarding("join", function() {
    
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
  
  test("combines the attributes of the two relations", function (){
    join = knit(function(){return join(person, house)})
    names = _.map(join.attributes, function(attr){return attr.name})
    assert.equal(["id", "house_id", "name", "age", "house_id", "address", "city_id"], names)
  })
  
  test("inspect", function (){knit(function(){
    assert.equal("join(r[id,house_id,name,age],r[house_id,address,city_id])", 
                 join(person, house).inspect())

    assert.equal("join(r[id,house_id,name,age],r[house_id,address,city_id],eq(4,5))", 
                 join(person, house, equality(4,5)).inspect())

  })})
  
  regarding("sameness and equivalence", function() {
    
    test("same", function (){knit(function(){
      assert.same(join(person, house), join(person, house))

      assert.notSame(join(person, house), join(house, city))
      assert.notSame(join(house, city), join(person, house))
    })})    

    test("same - with predicate", function (){knit(function(){
      assert.same(join(person, house, equality(person.attr("house_id"), house.attr("house_id"))),
                  join(person, house, equality(person.attr("house_id"), house.attr("house_id"))))

      assert.notSame(join(person, house, equality(person.attr("name"), house.attr("house_id"))),
                     join(person, house, equality(person.attr("house_id"), house.attr("house_id"))))
    })})

    test("same implies equivalent", function (){knit(function(){
      assert.equivalent(join(person, house), join(person, house))
    })})

    test("equivalent with predicate", function (){knit(function(){
      assert.equivalent(join(person, house, equality(person.attr("house_id"), house.attr("house_id"))),
                        join(person, house, equality(person.attr("house_id"), house.attr("house_id"))))

      assert.equivalent(join(person, house, equality(house.attr("house_id"), person.attr("house_id"))),
                        join(person, house, equality(person.attr("house_id"), house.attr("house_id"))))
    })})

    test("commutativity - two join functions are equivalent if the relations are the same but in different order", function (){knit(function(){
      assert.equivalent(join(person, house), join(house, person))
      assert.notEquivalent(join(person, house), join(person, city))
    })})

    test("nonassociativity - order of operations (inner/outer) matters", function (){knit(function(){
      assert.equivalent(join(join(person, house), city), join(join(person, house), city))
      assert.notEquivalent(join(join(person, house), city), join(person, join(house, city)))
    })})
    
  })
  
  regarding("appendToPredicate", function() {
    test("when there's only a True predicate existing, replace it", function (){knit(function(){
      assert.same(join(person, house).appendToPredicate(equality(4,5)), join(person, house, equality(4,5)))
      assert.same(join(person, house, TRUE).appendToPredicate(equality(4,5)), join(person, house, equality(4,5)))
    })})	  

    test("when there's any other kind of existing predicate, make a conjunction", function (){knit(function(){
      assert.same(join(person, house, equality(4,5)).appendToPredicate(equality(6,7)),
                  join(person, house, conjunction(equality(4,5), equality(6,7))))
    })})	  
	})
})

