require("../test_helper.js")
require("knit/algebra/attributes")
require("./../test_relation.js")

//does this really belong under algebra?

regarding("attributes", function() {
    
  beforeEach(function() {
    var person = new TestRelation(["personId", "houseId", "name", "age"])
    this.$R = knit.createBuilderFunction({bindings:{
      person:person,
      house:new TestRelation(["houseId", "address", {"people":person}])
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

  test("iterable in underscore", function(){this.$R(function(){
    assert.equal(["people", "name"], 
                 _.map(new knit.algebra.Attributes([attr("house.people"), attr("person.name")]), function(attr){return attr.name()}))
  })})

  test("splice", function(){this.$R(function(){
    var original = new knit.algebra.Attributes([attr("house.people"), attr("person.name")])
    original.splice(1,1,attr("house.address"))
    assert.equal(["people", "address"], _.map(original, function(attr){return attr.name()}))
  })})
    
  test("size", function(){this.$R(function(){
    assert.equal(2, new knit.algebra.Attributes([attr("house.people"), attr("person.name")]).size())
  })})

  test("names", function(){this.$R(function(){
    assert.equal(["people", "name"], 
                 new knit.algebra.Attributes([attr("house.people"), attr("person.name")]).names())
  })})

  test("splice nested attribute - puts the nested attribute in the first place one " +
       "of the consitutent attributes is found, then removes the constituent attributes from the top level", function(){
    var original = this.$R(function(){
      return new knit.algebra.Attributes(attr("house.houseId", "person.personId", "person.name", "house.address", "person.age"))
    })
    var house = this.$R(function(){return relation("house")})

    var splicedIn = original.spliceInNestedAttribute(house.attr("people"))
    assert.equal(["houseId", "people", "address"], _.map(splicedIn, function(attr){return attr.name()}))
  })

    
})