require("./test_helper.js")
require("knit/attribute")

regarding("knit.Attribute", function () {

  test("an attribute has a name and a type", function () {
    var name = new knit.Attribute("name", knit.Attribute.StringType)
    assert.equal("name", name.name())
    assert.equal(knit.Attribute.StringType, name.type())
  })

})

regarding("knit.Attributes", function () {

  test("names", function () {
    var name = new knit.Attribute("name", knit.Attribute.StringType)
    var age = new knit.Attribute("age", knit.Attribute.StringType)
    
    assert.equal(["name", "age"], new knit.Attributes([name, age]).names())
  })

  test("get", function () {
    var name = new knit.Attribute("name", knit.Attribute.StringType)
    var age = new knit.Attribute("age", knit.Attribute.StringType)
    
    assert.equal(["name"], new knit.Attributes([name, age]).get("name").names())
  })

  test("concat", function () {
    var name = new knit.Attribute("name", knit.Attribute.StringType)
    var age = new knit.Attribute("age", knit.Attribute.StringType)
    
    assert.equal(
      ["name", "age"], 
      new knit.Attributes(new knit.Attributes([name]).concat(new knit.Attributes([age]))).names()
    )
  })

})

