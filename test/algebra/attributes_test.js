require("../test_helper.js")
require("knit/algebra/attributes")
require("./../test_relation.js")

//does this really belong under algebra?

regarding("attributes", function() {
    
  beforeEach(function() {
    this.$R = knit.createBuilderFunction({bindings:{
      person:new TestRelation(["personId", "houseId", "name", "age"]),
      house:new TestRelation(["houseId", "address", {"people":new TestRelation(["personId", "houseId", "name", "age"])}])
    }})
  })

  test("inspect", function(){this.$R(function(){
    assert.equal("*people,*name", 
                 new knit.algebra.Attributes([attr("house.people"), attr("person.name")]).inspect())
  })})

  regarding("sameness and equivalence", function() {
    test("same", function(){this.$R(function(){
      assert.same(new knit.algebra.Attributes([attr("house.people"), attr("person.name")]), 
                  new knit.algebra.Attributes([attr("house.people"), attr("person.name")]))
      assert.notSame(new knit.algebra.Attributes([attr("house.people"), attr("person.age")]), 
                     new knit.algebra.Attributes([attr("house.people"), attr("person.name")]))
    })})    
  
    test("equivalence and sameness are the same thing", function(){this.$R(function(){
      assert.equivalent(new knit.algebra.Attributes([attr("house.people"), attr("person.name")]), 
                        new knit.algebra.Attributes([attr("house.people"), attr("person.name")]))
      assert.notEquivalent(new knit.algebra.Attributes([attr("house.people"), attr("person.age")]), 
                           new knit.algebra.Attributes([attr("house.people"), attr("person.name")]))
    })})    
  })

  test("concat", function(){this.$R(function(){
    assert.same(new knit.algebra.Attributes([attr("house.people"), attr("person.name")]), 
                new knit.algebra.Attributes([attr("house.people")]).concat(new knit.algebra.Attributes([attr("person.name")])))
  })})

  test("shallow copy", function(){this.$R(function(){
    var original = new knit.algebra.Attributes([attr("house.people"), attr("person.name")])
    var copy = original.clone()

    assert.same(original, copy)
    
    copy.attributeArray.push(attr("house.address")) //breaking encapsulation to prove this
    assert.notSame(original, copy)
  })})

  test("iterable in underscore", function(){this.$R(function(){
    assert.equal(["people", "name"], 
                 _.map(new knit.algebra.Attributes([attr("house.people"), attr("person.name")]), function(attr){return attr.name()}))
  })})

  test("splice", function(){this.$R(function(){
    var original = new knit.algebra.Attributes([attr("house.people"), attr("person.name")])
    original.splice(1,1,attr("house.address"))
    assert.equal(["people", "address"], _.map(original, function(attr){return attr.name()}))
  })})
    
  test("length", function(){this.$R(function(){
    assert.equal(2, new knit.algebra.Attributes([attr("house.people"), attr("person.name")]).length())
  })})

  test("names", function(){this.$R(function(){
    assert.equal(["people", "name"], 
                 new knit.algebra.Attributes([attr("house.people"), attr("person.name")]).names())
  })})

    
})