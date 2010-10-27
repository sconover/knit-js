require("../test_helper.js")
require("knit/function/join")
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
    names = _.map(join.attributes, function(attr){return attr.name()})
    assert.equal(["id", "house_id", "name", "age", "house_id", "address", "city_id"], names)
  })
  
  regarding("sameness and equivalence", function() {
    
    test("same", function (){knit(function(){
      assert.equal(true, join(person, house).isSame(join(person, house)))

      assert.equal(false, join(person, house).isSame(join(house, city)))
      assert.equal(false, join(house, city).isSame(join(person, house)))
    })})

    test("same implies equivalent", function (){knit(function(){
      assert.equal(true, join(person, house).isEquivalent(join(person, house)))
    })})

    test("commutativity - two join functions are equivalent if the relations are the same but in different order", function (){knit(function(){
      assert.equal(true, join(person, house).isEquivalent(join(house, person)))
      
      assert.equal(false, join(person, house).isEquivalent(join(person, city)))
    })})

    test("nonassociativity - order of operations (inner/outer) matters", function (){knit(function(){
      assert.equal(true, join(join(person, house), city).isEquivalent(join(join(person, house), city)))
      
      assert.equal(false, join(join(person, house), city).isEquivalent(join(person, join(house, city))))
    })})
    
  })
  
  
})

