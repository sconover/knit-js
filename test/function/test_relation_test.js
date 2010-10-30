require("../test_helper")
require("knit/function/join")
require("./test_relation")

regarding("test relation sameness", function() {
  
  regarding("sameness", function() {

	  test("same", function(){knit(function(){
	    r1 = testRelation([["a", knit.Attribute.IntegerType]])
	    r2 = testRelation([["a", knit.Attribute.IntegerType]])
	    r3 = testRelation([["b", knit.Attribute.IntegerType]])
	    assert.equal(true, r1.isSame(r1))
	
	    assert.equal(false, r1.isSame(r2))
	    assert.equal(false, r1.isSame(r3))
	  })})

	  test("equivalence of test relations is the same as sameness", function (){knit(function(){
	    r1 = testRelation([["a", knit.Attribute.IntegerType]])
	    r2 = testRelation([["a", knit.Attribute.IntegerType]])
	    r3 = testRelation([["b", knit.Attribute.IntegerType]])
	    assert.equal(true, r1.isEquivalent(r1))
	
	    assert.equal(false, r1.isEquivalent(r2))
	    assert.equal(false, r1.isEquivalent(r3))
	  })})
 
	  test("inspect", function (){knit(function(){
	    var r = testRelation([["a", knit.Attribute.IntegerType], ["b", knit.Attribute.IntegerType]])
   
	    assert.equal("r[a,b]", r.inspect())
	  })})
	
	})
	
	regarding("attribute", function() {

	  test("sameness.  and attribute is equal to the same attribute from the same relation", function(){knit(function(){
	    r1 = testRelation([["a", knit.Attribute.IntegerType]])
	    r2 = testRelation([["a", knit.Attribute.IntegerType], ["b", knit.Attribute.IntegerType]])
	    assert.equal(true, r1.attr("a").isSame(r1.attr("a")))
	
	    assert.equal(false, r1.attr("a").isSame(r2.attr("a")))
	    assert.equal(false, r1.attr("a").isSame(r2.attr("b")))
	  })})

	})
})

