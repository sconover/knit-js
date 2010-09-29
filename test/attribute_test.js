require("./test_helper.js");
require("arel/attribute")

regarding("arel.Attribute", function () {

  test("an attribute has a name and a type", function () {
    var name = new arel.Attribute("name", arel.Attribute.StringType)
    assert.equal("name", name.name);
    assert.equal(arel.Attribute.StringType, name.type);
  });

});

