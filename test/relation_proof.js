global.relationProof = function(name, createRelationFunction) {
  global.relationProof.createRelationFunction = createRelationFunction

  regarding(name + " relation sameness", function() {

    regarding("sameness", function() {

      test("same", function(){knit(function(){
      
        r1 = relationProof.createRelationFunction(["a"])
        r2 = relationProof.createRelationFunction(["a"])
        r3 = relationProof.createRelationFunction(["b"])

        assert.same(r1, r1)
        assert.notSame(r1, r2)
        assert.notSame(r1, r3)
      })})

      test("equivalence of " + name + " relations is the same as sameness", function (){knit(function(){
        r1 = relationProof.createRelationFunction(["a"])
        r2 = relationProof.createRelationFunction(["a"])
        r3 = relationProof.createRelationFunction(["b"])

        assert.equivalent(r1, r1)
        assert.notEquivalent(r1, r2)
        assert.notEquivalent(r1, r3)
      })})
   
    })
  
    regarding("attribute", function() {

      test("sameness.  and attribute is equal to the same attribute from the same relation", function(){knit(function(){
        r1 = relationProof.createRelationFunction(["a"])
        r2 = relationProof.createRelationFunction(["a", "b"])
    
        assert.same(r1.attr("a"), r1.attr("a"))
        assert.notSame(r1.attr("a"), r2.attr("a"))
        assert.notSame(r1.attr("a"), r2.attr("b"))
      })})

    })
  })

}
