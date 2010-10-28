require("./test_helper.js")
require("knit/attribute")

regarding("knit.Attribute", function () {

  test("an attribute has a name and a type", function () {
    var name = new knit.Attribute("name", knit.Attribute.StringType)
    assert.equal("name", name.name())
    assert.equal(knit.Attribute.StringType, name.type())
  })

  test("inspect", function () {
    var name = new knit.Attribute("name", knit.Attribute.StringType)
    assert.equal("name", name.inspect())
  })

})

regarding("knit.Attribute - same", function () {

  test("two attributes are the same if their names and types are the same", function () {
    var a1 = new knit.Attribute("a", knit.Attribute.StringType)
    var a2 = new knit.Attribute("a", knit.Attribute.StringType)
    var a3 = new knit.Attribute("b", knit.Attribute.StringType)
    var a4 = new knit.Attribute("a", knit.Attribute.IntegerType)
    assert.equal(true, a1.isSame(a2))
    assert.equal(false, a1.isSame(a3))
    assert.equal(false, a1.isSame(a4))
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

