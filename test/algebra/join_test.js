require("../test_helper.js")
require("knit/algebra/join")
require("./test_relation.js")

regarding("join", function() {
    
  beforeEach(function() {
    person = knit(function(){return testRelation(["id", "houseId", "name", "age"])})
    house = knit(function(){return testRelation(["houseId", "address", "cityId"])})
    city = knit(function(){return testRelation(["cityId", "name"])})
  })
  
  test("combines the attributes of the two relations", function (){
    join = knit(function(){return join(person, house)})
    names = _.map(join.attributes(), function(attr){return attr.name})
    assert.equal(["id", "houseId", "name", "age", "houseId", "address", "cityId"], names)
  })
  
  test("inspect", function(){knit(function(){
    assert.equal("join(r[id,houseId,name,age],r[houseId,address,cityId])", 
                 join(person, house).inspect())

    assert.equal("join(r[id,houseId,name,age],r[houseId,address,cityId],eq(4,5))", 
                 join(person, house, equality(4,5)).inspect())

  })})
  
  regarding("sameness and equivalence", function() {
    
    test("same", function (){knit(function(){
      assert.same(join(person, house), join(person, house))

      assert.notSame(join(person, house), join(house, city))
      assert.notSame(join(house, city), join(person, house))
    })})    

    test("same - with predicate", function (){knit(function(){
      assert.same(join(person, house, equality(person.attr("houseId"), house.attr("houseId"))),
                  join(person, house, equality(person.attr("houseId"), house.attr("houseId"))))

      assert.notSame(join(person, house, equality(person.attr("name"), house.attr("houseId"))),
                     join(person, house, equality(person.attr("houseId"), house.attr("houseId"))))
    })})

    test("same implies equivalent", function (){knit(function(){
      assert.equivalent(join(person, house), join(person, house))
    })})

    test("equivalent with predicate", function (){knit(function(){
      assert.equivalent(join(person, house, equality(person.attr("houseId"), house.attr("houseId"))),
                        join(person, house, equality(person.attr("houseId"), house.attr("houseId"))))

      assert.equivalent(join(person, house, equality(house.attr("houseId"), person.attr("houseId"))),
                        join(person, house, equality(person.attr("houseId"), house.attr("houseId"))))
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

