require("../test_helper")
require("knit/algebra/join")
require("./test_relation")
require("../relation_proof")

relationProof("TestRelation", function(attributeNames){ return new TestRelation(attributeNames) } )

regarding("TestRelation inspect", function() {
  test("inspect", function (){
    var r = new TestRelation(["a", "b"])

    assert.equal("r[a,b]", r.inspect())
  })
})
