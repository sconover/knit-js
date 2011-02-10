require("../test_helper.js")
require("knit/core")
require("./../test_relation.js")

//does this really belong under algebra?

regarding("attributes", function() {
    
  beforeEach(function() {
    setupPersonHouseCity(this)
    this.house = new TestRelation([["houseId", knit.attributeType.Integer], 
                                   ["address", knit.attributeType.String], 
                                   {"people":this.person}])
    this.$R = knit.createBuilderFunction({bindings:{
      person:this.person,
      house:this.house
    }})
  })

  test("inspect", function(){this.$R(function(){
    assert.equal("*people,*name", 
                 new knit.Attributes([attr("house.people"), attr("person.name")]).inspect())
  })})

  regarding("sameness and equivalence", function() {
    test("same", function(){this.$R(function(){
      assert.same(new knit.Attributes([attr("house.people"), attr("person.name")]), 
                  new knit.Attributes([attr("house.people"), attr("person.name")]))
      assert.notSame(new knit.Attributes([attr("house.people"), attr("person.age")]), 
                     new knit.Attributes([attr("house.people"), attr("person.name")]))
    })})    
  
    test("equivalence and sameness are the same thing", function(){this.$R(function(){
      assert.equivalent(new knit.Attributes([attr("house.people"), attr("person.name")]), 
                        new knit.Attributes([attr("house.people"), attr("person.name")]))
      assert.notEquivalent(new knit.Attributes([attr("house.people"), attr("person.age")]), 
                           new knit.Attributes([attr("house.people"), attr("person.name")]))
    })})    
  })

  test("names", function(){this.$R(function(){
    assert.equal(["people", "name"], 
                 new knit.Attributes([attr("house.people"), attr("person.name")]).names())
  })})

  test("types", function(){
    assert.equal([knit.attributeType.Integer, knit.attributeType.String], 
                 new knit.Attributes([this.house.attr("houseId"), this.person.attr("name")]).types())
  })

  test("namesAndTypes", function(){
    assert.equal([["houseId",knit.attributeType.Integer], ["name",knit.attributeType.String]], 
                 new knit.Attributes([this.house.attr("houseId"), this.person.attr("name")]).namesAndTypes())
  })

  test("get single", function(){this.$R(function(){
    var attributes = new knit.Attributes([attr("house.people"), attr("person.name")])
    assert.equal(attr("house.people"), attributes.get("people"))
  })})

  test("get multiple", function(){this.$R(function(){
    var attributes = new knit.Attributes([attr("house.people"), attr("person.name")])
    assert.same(new knit.Attributes([attr("house.people"), attr("person.name")]), attributes.get("people", "name"))
  })})

  test("splice nested attribute - puts the nested attribute in the first place one " +
       "of the consitutent attributes is found, then removes the constituent attributes from the top level", function(){
    var original = new knit.Attributes([this.house.attr("houseId"), this.person.attr("personId"), this.person.attr("name"), 
                                        this.house.attr("address"), this.person.attr("age")])
    var splicedIn = original.spliceInNestedAttribute(this.house.attr("people"))
    assert.equal(["houseId", "people", "address"], splicedIn.names())
  })

    
})