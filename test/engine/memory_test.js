require("../test_helper")
require("knit/engine/memory")
require("../relation_proof")

regarding("memory", function() {
	beforeEach(function(){
		engine = new knit.engine.Memory()
		r = engine.createRelation("foo", ["a", "b"])
	})
	
	relationProof("MemoryRelation", function(attributeNames){ return engine.createRelation("x", attributeNames) } )
	
	regarding("MemoryRelation inspect", function() {
		test("inspect", function(){
		  assert.equal("foo[a,b]", r.inspect())
		})
	})

	regarding("memory predicate - match", function() {
	
		test("true false match", function(){knit(function(){
			assert.equal(true, TRUE.match([[r.attr("b"),1]]))
			assert.equal(false, FALSE.match([[r.attr("b"),1]]))
		})})

		test("equality match", function(){knit(function(){
			assert.equal(true, equality(r.attr("b"), 1).match([[r.attr("b"),1]]))
			assert.equal(false, equality(r.attr("b"), 1).match([[r.attr("b"),2]]))
			assert.equal(false, equality(r.attr("b"), 1).match([[r.attr("a"),1]]))
		})})

		test("conjunction match", function(){knit(function(){
			assert.equal(true, conjunction(equality(r.attr("b"), 1), equality(r.attr("a"), 999)).
													 match([[r.attr("a"),999], [r.attr("b"),1]]))
			assert.equal(false, conjunction(equality(r.attr("b"), 2), equality(r.attr("a"), 999)).
													  match([[r.attr("a"),999], [r.attr("b"),1]]))
			assert.equal(false, conjunction(equality(r.attr("b"), 1), equality(r.attr("a"), 888)).
													  match([[r.attr("a"),999], [r.attr("b"),1]]))
		})})
	})
	
	
	regarding("the 'cost' of an apply using the memory engine is the sum of all the tuples of all relations created", function() {

		test("just applying a relation and doing nothing else is zero cost", function(){knit(function(){
			assert.equal(0, r.apply().cost)
		})})
		
		test("the size of the select result is the cost", function(){knit(function(){
			r.insertSync([
				[1, 98],
				[2, 98],
				[3, 99]
			])
			
			assert.equal(1, select(r, equality(r.attr("a"), 1)).apply().cost)
			assert.equal(2, select(r, equality(r.attr("b"), 98)).apply().cost)
			assert.equal(3, select(r, TRUE).apply().cost)
			assert.equal(6, select(select(r, TRUE), TRUE).apply().cost)
		})})
		
	})
})