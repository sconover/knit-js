require("./test_helper.js")
require("knit/relation")
require("knit/rename")

regarding("knit.Rename", function () {

  regarding("relations", function () {
    
    test("makes a copy of the relation with a different name", function () {
      var person = new knit.MutableRelation("person")
                    .attr("name", knit.Attribute.StringType)      
                    .attr("age", knit.Attribute.IntegerType)      

      assert.equal("person", person.name())
      assert.equal(["name", "age"], _.map(person.attributes(), function(attr){return attr.name()}))
      
      var alien = new knit.Rename(person, "alien")
      
      assert.equal("alien", alien.name())
      assert.equal(["name", "age"], _.map(person.attributes(), function(attr){return attr.name()}))
      
      assert.equal("person", person.name())
    })
    
  })

  regarding("attributes", function () {
    
    test("makes a copy of the attribute with a different name", function () {

      var age = new knit.Attribute("age", knit.Attribute.IntegerType)
      assert.equal("age", age.name())
      
      var oldness = new knit.Rename(age, "oldness")
      
      assert.equal("oldness", oldness.name())
      assert.equal("age", age.name())
    })
    
  })
})

