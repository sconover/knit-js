require("./test_helper.js")
require("arel/attribute")

regarding("arel.Attribute", function () {

  test("an attribute has a name and a type", function () {
    var name = new arel.Attribute("name", arel.Attribute.StringType)
    assert.equal("name", name.name())
    assert.equal(arel.Attribute.StringType, name.type())
  })

})

regarding("arel.Attributes", function () {

  test("names", function () {
    var name = new arel.Attribute("name", arel.Attribute.StringType)
    var age = new arel.Attribute("age", arel.Attribute.StringType)
    
    assert.equal(["name", "age"], new arel.Attributes([name, age]).names())
  })

  test("get", function () {
    var name = new arel.Attribute("name", arel.Attribute.StringType)
    var age = new arel.Attribute("age", arel.Attribute.StringType)
    
    assert.equal(["name"], new arel.Attributes([name, age]).get("name").names())
  })

  test("concat", function () {
    var name = new arel.Attribute("name", arel.Attribute.StringType)
    var age = new arel.Attribute("age", arel.Attribute.StringType)
    
    assert.equal(
      ["name", "age"], 
      new arel.Attributes(new arel.Attributes([name]).concat(new arel.Attributes([age]))).names()
    )
  })

})

