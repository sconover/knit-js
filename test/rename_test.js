require("./test_helper.js");
require("arel/relation")
require("arel/rename")

regarding("arel.Rename", function () {

  regarding("relations", function () {
    
    test("makes a copy of the relation with a different name", function () {
      var person = new arel.MutableRelation("person")
                    .attr("name", arel.Attribute.StringType)      
                    .attr("age", arel.Attribute.IntegerType);      

      assert.equal("person", person.name());
      assert.equal(["name", "age"], _.map(person.attributes(), function(attr){return attr.name()}));
      
      var alien = new arel.Rename(person, "alien")
      
      assert.equal("alien", alien.name());
      assert.equal(["name", "age"], _.map(person.attributes(), function(attr){return attr.name()}));
      
      assert.equal("person", person.name());
    });
    
  });

  regarding("attributes", function () {
    
    test("makes a copy of the attribute with a different name", function () {

      var age = new arel.Attribute("age", arel.Attribute.IntegerType)
      assert.equal("age", age.name());
      
      var oldness = new arel.Rename(age, "oldness")
      
      assert.equal("oldness", oldness.name());
      assert.equal("age", age.name());
    });
    
  });
});

