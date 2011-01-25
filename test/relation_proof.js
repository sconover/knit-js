global.relationProof = function(name, createRelationFunction) {
  global.relationProof.createRelationFunction = createRelationFunction

  regarding(name + " relation sameness", function() {

    regarding("sameness", function() {

      test("same", function(){
      
        r1 = relationProof.createRelationFunction(["a"])
        r2 = relationProof.createRelationFunction(["a"])
        r3 = relationProof.createRelationFunction(["b"])

        assert.same(r1, r1)
        assert.notSame(r1, r2)
        assert.notSame(r1, r3)
      })

      test("equivalence of " + name + " is based on whether the attributes match up", function(){
        r1 = relationProof.createRelationFunction(["a"])
        r2 = relationProof.createRelationFunction([r1.attr("a")])
        r3 = relationProof.createRelationFunction(["a"])
        r4 = relationProof.createRelationFunction(["b"])
        
        assert.equivalent(r1, r1)
        assert.equivalent(r1, r2)
        assert.notEquivalent(r1, r3)
        assert.notEquivalent(r1, r4)
      })
   
    })
  
    regarding("id", function() {

      test("relations have ids and they are different form each other", function(){
      
        r1 = relationProof.createRelationFunction(["a"])
        r2 = relationProof.createRelationFunction(["a"])
        r3 = relationProof.createRelationFunction(["b"])

        assert.equal(r1.id(), r1.id())
        assert.notEqual(r1.id(), r2.id())
        assert.notEqual(r1.id(), r3.id())
      })

    })
  
    regarding("attribute", function() {

      test("sameness.  an attribute is equal to the same attribute from the same relation", function(){
        r1 = relationProof.createRelationFunction(["a"])
        r2 = relationProof.createRelationFunction(["a", "b"])
    
        assert.same(r1.attr("a"), r1.attr("a"))
        assert.notSame(r1.attr("a"), r2.attr("a"))
        assert.notSame(r1.attr("a"), r2.attr("b"))
      })

      test("equivalent is the same as same", function(){
        r1 = relationProof.createRelationFunction(["a"])
        r2 = relationProof.createRelationFunction(["a", "b"])
    
        assert.equivalent(r1.attr("a"), r1.attr("a"))
        assert.notEquivalent(r1.attr("a"), r2.attr("a"))
        assert.notEquivalent  (r1.attr("a"), r2.attr("b"))
      })

    })

    regarding("nested attribute", function() {

      test("sameness.  a nested attribute is the same if it has the same name, the same nested relation, and it's from the same source relation", function(){
        nestedRelation = relationProof.createRelationFunction(["Y", "Z"])
        r1 = relationProof.createRelationFunction([{"a":nestedRelation}])
        r2 = relationProof.createRelationFunction([{"a":nestedRelation}, {"b":nestedRelation}])
        r3 = relationProof.createRelationFunction(["a", "b"])
    
        assert.same(r1.attr("a"), r1.attr("a"))
        assert.notSame(r1.attr("a"), r2.attr("b"))
        assert.notSame(r1.attr("a"), r3.attr("a"))
      })

    })
  })

}
