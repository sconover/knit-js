require("./test_helper.js")

regarding("function equivalence and sameness", function () {

  xregarding("join", function () {
    beforeEach(function() {
      r1 = knit(function(){return testStub("one", [["a", knit.Attribute.IntegerType]])})
      r2 = knit(function(){return testStub("two", [["b", knit.Attribute.IntegerType]])})
      r3 = knit(function(){return testStub("three", [["c", knit.Attribute.IntegerType]])})
    })

    test("same", function (){knit(function(){
      assert.equal(true, join(r1, r2).isSame(join(r1, r2)))

      assert.equal(false, join(r1, r2).isSame(join(r2, r3)))
      assert.equal(false, join(r2, r3).isSame(join(r1, r2)))
    })()})

    test("same implies equivalent", function (){knit(function(){
      assert.equal(true, join(r1, r2).isEquivalent(join(r1, r2)))
    })()})

    test("commutativity - two join functions are equivalent if the attributes are the same but in different order", function (){knit(function(){
      assert.equal(true, join(r1, r2).isEquivalent(join(r2, r1)))
      
      assert.equal(false, join(r1, r2).isEquivalent(join(r1, r3)))
    })()})
  })
    
})

