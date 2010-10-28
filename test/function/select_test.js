require("../test_helper.js")
require("knit/function/select")
require("./test_relation.js")

regarding("select", function() {
    
  beforeEach(function() {
    person = knit(function(){return testRelation([
      ["id", knit.Attribute.IntegerType],
      ["house_id", knit.Attribute.IntegerType],
      ["name", knit.Attribute.StringType],
      ["age", knit.Attribute.IntegerType]
    ])})    
    
    house = knit(function(){return testRelation([
      ["house_id", knit.Attribute.IntegerType],
      ["address", knit.Attribute.StringType],
      ["city_id", knit.Attribute.IntegerType]
    ])})
  })

  test("inspect", function (){knit(function(){
    assert.equal("select(r[id,house_id,name,age],eq(1,1))", 
                 select(person, TRUE).inspect())
  })})

  
  regarding("sameness and equivalence", function() {
    
    test("same - simple", function (){knit(function(){
      assert.equal(true, select(person, TRUE).isSame(select(person, TRUE)))
      
      assert.equal(false, select(person, TRUE).isSame(select(person, FALSE)))
      assert.equal(false, select(person, TRUE).isSame(select(house, TRUE)))
    })})
        
    test("commutativity - order of selects doesn't matter (effectively a conjunction)", function (){knit(function(){
      assert.equal(true, select(select(person, FALSE), TRUE).
                           isEquivalent(select(select(person, TRUE), FALSE)))
      
      assert.equal(false, select(select(person, FALSE), TRUE).
                            isEquivalent(select(select(person, FALSE), FALSE)))
      
      assert.equal(false, select(select(person, FALSE), TRUE).
                            isSame(select(select(person, TRUE), FALSE)))
    })})
    
    test("split selects are equivalent", function (){knit(function(){
      assert.equal(true, select(person, conjunction(TRUE, FALSE)).
                           isEquivalent(select(select(person, TRUE), FALSE)))
      
      assert.equal(true, select(person, conjunction(TRUE, FALSE)).
                           isEquivalent(select(select(person, FALSE), TRUE)))
      
      assert.equal(false, select(person, conjunction(TRUE, FALSE)).
                            isEquivalent(select(select(person, TRUE), TRUE)))
      
      assert.equal(false, select(person, conjunction(TRUE, FALSE)).
                            isSame(select(select(person, TRUE), FALSE)))
    })})
    
  })
  
  regarding("merging and splitting", function() {
    
    test("merge a nested selection, becomes a conjunction", function(){knit(function(){      
      assert.equal(true, select(select(person, TRUE), FALSE).
                           merge().isSame(select(person, conjunction(TRUE, FALSE))))
    })})
      
    test("merge a fully merged selection does nothing", function(){knit(function(){
      assert.equal(true, select(person, conjunction(TRUE, FALSE)).
                           merge().isSame(select(person, conjunction(TRUE, FALSE))))
    })})
      
      
    test("split a select having a conjunction, makes separate nested selects", function(){knit(function(){
      assert.equal(true, select(person, conjunction(TRUE, FALSE)).
                           split().isSame(select(select(person, TRUE), FALSE)))
    })})

    test("it's splits (and merges) all the way down", function(){knit(function(){
      var nested = select(select(person, conjunction(TRUE, TRUE)), conjunction(FALSE, FALSE))
      
      assert.equal(true, nested.split().isSame(
                             select(
                               select(
                                 select(
                                   select(person, TRUE), 
                                   TRUE
                                 ),
                                 FALSE
                               ),
                               FALSE
                             )
                           )
                  )
                  
      assert.equal(true, nested.isSame(nested.split().merge()))
    })})

    test("split a fully split selection, does nothing", function(){knit(function(){      
      assert.equal(true, select(select(person, TRUE), FALSE).
                           split().isSame(select(select(person, TRUE), FALSE)))
    })})
      
  })
})

