require("../test_helper")
require("knit/engine/memory")
require("../relation_proof")

engine = new knit.engine.Memory()
relationProof("MemoryRelation", function(attributeNames){ return engine.createRelation("x", attributeNames) } )

regarding("MemoryRelation inspect", function() {
	test("inspect", function (){
	  var r = engine.createRelation("foo", ["a", "b"])

	  assert.equal("foo[a,b]", r.inspect())
	})
})
