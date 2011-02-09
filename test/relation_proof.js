global.relationProof = function(name, createRelationFunction) {

  describe(name + " relation sameness", function() {

    describe("sameness", function() {

      test("same", function(){
      
        r1 = createRelationFunction(["a"])
        r2 = createRelationFunction(["a"])
        r3 = createRelationFunction(["b"])

        assert.same(r1, r1)
        assert.notSame(r1, r2)
        assert.notSame(r1, r3)
      })

      test("equivalence of " + name + " is based on whether the attributes match up", function(){
        r1 = createRelationFunction(["a"])
        r2 = createRelationFunction([r1.attr("a")])
        r3 = createRelationFunction(["a"])
        r4 = createRelationFunction(["b"])
        
        assert.equivalent(r1, r1)
        assert.equivalent(r1, r2)
        assert.notEquivalent(r1, r3)
        assert.notEquivalent(r1, r4)
      })
   
    })
  
    describe("id", function() {

      test("relations have ids and they are different form each other", function(){
      
        r1 = createRelationFunction(["a"])
        r2 = createRelationFunction(["a"])
        r3 = createRelationFunction(["b"])

        assert.equal(r1.id(), r1.id())
        assert.notEqual(r1.id(), r2.id())
        assert.notEqual(r1.id(), r3.id())
      })

    })
  
    describe("attribute", function() {

      test("sameness.  an attribute is equal to the same attribute from the same relation", function(){
        r1 = createRelationFunction(["a"])
        r2 = createRelationFunction(["a", "b"])
    
        assert.same(r1.attr("a"), r1.attr("a"))
        assert.notSame(r1.attr("a"), r2.attr("a"))
        assert.notSame(r1.attr("a"), r2.attr("b"))
      })

      test("equivalent is the same as same", function(){
        r1 = createRelationFunction(["a"])
        r2 = createRelationFunction(["a", "b"])
    
        assert.equivalent(r1.attr("a"), r1.attr("a"))
        assert.notEquivalent(r1.attr("a"), r2.attr("a"))
        assert.notEquivalent  (r1.attr("a"), r2.attr("b"))
      })

    })

    describe("nested attribute", function() {

      test("sameness.  a nested attribute is the same if it has the same name, the same nested relation, and it's from the same source relation", function(){
        nestedRelation = createRelationFunction(["Y", "Z"])
        r1 = createRelationFunction([{"a":nestedRelation}])
        r2 = createRelationFunction([{"a":nestedRelation}, {"b":nestedRelation}])
        r3 = createRelationFunction(["a", "b"])
    
        assert.same(r1.attr("a"), r1.attr("a"))
        assert.notSame(r1.attr("a"), r2.attr("b"))
        assert.notSame(r1.attr("a"), r3.attr("a"))
      })

    })
  })

}
