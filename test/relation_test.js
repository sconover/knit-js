require("./test_helper.js");
require("arel/relation")

regarding("arel.Relation", function () {

  regarding("a relation has a heading", function () {
    
    test('a heading has attributes.  the heading is enumerable.', function () {
      
      var name = new arel.Attribute("name", arel.Attribute.StringType);      
      var age = new arel.Attribute("age", arel.Attribute.IntegerType);
      
      names = _.map(new arel.Relation.Heading([name, age]), function(attr){return attr.name})
      
      assert.equal(["name", "age"], names);
    });

  });

});

