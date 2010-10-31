require("../test_helper")
require("knit/algebra/join")
require("./test_relation")
require("../relation_proof")

relationProof("TestRelation", function(attributeNames){ return new knit.TestRelationFunction(attributeNames) } )

regarding("TestRelation inspect", function() {
	test("inspect", function (){
	  var r = new knit.TestRelationFunction(["a", "b"])

	  assert.equal("r[a,b]", r.inspect())
	})
})
