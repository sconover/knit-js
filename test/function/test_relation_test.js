require("../test_helper")
require("knit/function/join")
require("./test_relation")

regarding("test relation sameness", function() {
  
  regarding("sameness", function() {

	  test("same", function(){knit(function(){
	    r1 = testRelation([["a", knit.Attribute.IntegerType]])
	    r2 = testRelation([["a", knit.Attribute.IntegerType]])
	    r3 = testRelation([["b", knit.Attribute.IntegerType]])

	    assert.same(r1, r1)
	    assert.notSame(r1, r2)
	    assert.notSame(r1, r3)
	  })})

	  test("equivalence of test relations is the same as sameness", function (){knit(function(){
	    r1 = testRelation([["a", knit.Attribute.IntegerType]])
	    r2 = testRelation([["a", knit.Attribute.IntegerType]])
	    r3 = testRelation([["b", knit.Attribute.IntegerType]])

	    assert.equivalent(r1, r1)
	    assert.notEquivalent(r1, r2)
	    assert.notEquivalent(r1, r3)
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

	    assert.same(r1.attr("a"), r1.attr("a"))
	    assert.notSame(r1.attr("a"), r2.attr("a"))
	    assert.notSame(r1.attr("a"), r2.attr("b"))
	  })})

	})
})

