require("../test_helper.js")
require("knit/function/predicate")

regarding("predicates", function() {
  
  test("sameness", function(){knit(function(){
    assert.equal(true, TRUE.isSame(TRUE))
    assert.equal(false, TRUE.isSame(FALSE))
    assert.equal(true, FALSE.isSame(FALSE))
    assert.equal(false, FALSE.isSame(TRUE))
    
    assert.equal(true, equality(TRUE, FALSE).isSame(equality(TRUE, FALSE)))
    assert.equal(false, equality(TRUE, FALSE).isSame(equality(TRUE, TRUE)))
    
    assert.equal(true, conjunction(TRUE, FALSE).isSame(conjunction(TRUE, FALSE)))
    assert.equal(false, conjunction(TRUE, FALSE).isSame(conjunction(TRUE, TRUE)))
  })})  
  
  test("shorthand", function(){knit(function(){
    assert.equal(true, eq(TRUE, FALSE).isSame(equality(TRUE, FALSE)))
        
    assert.equal(true, and(TRUE, FALSE).isSame(conjunction(TRUE, FALSE)))
  })})  

  test("inspect", function(){knit(function(){
    assert.equal("TRUE", TRUE.inspect())
    assert.equal("FALSE", FALSE.inspect())
    
    assert.equal("eq(TRUE,FALSE)", equality(TRUE, FALSE).inspect())
    
    assert.equal("and(TRUE,FALSE)", conjunction(TRUE, FALSE).inspect())
  })})  
    
  test("associativity - order doesn't matter", function(){knit(function(){
    assert.equal(true, equality(TRUE, FALSE).isEquivalent(equality(FALSE, TRUE)))
    assert.equal(false, equality(TRUE, FALSE).isEquivalent(equality(FALSE, FALSE)))

    assert.equal(true, conjunction(TRUE, FALSE).isEquivalent(conjunction(FALSE, TRUE)))
    assert.equal(false, conjunction(TRUE, FALSE).isEquivalent(conjunction(FALSE, FALSE)))

    assert.equal(true, conjunction(conjunction(TRUE, TRUE), FALSE).
                        isEquivalent(conjunction(FALSE, conjunction(TRUE, TRUE))))
    assert.equal(false, conjunction(conjunction(TRUE, TRUE), FALSE).
                        isEquivalent(conjunction(TRUE, conjunction(TRUE, TRUE))))
  })})
  
  test("associativity - nested equivalence", function(){knit(function(){
    assert.equal(true, conjunction(equality(TRUE, FALSE), FALSE).
                        isEquivalent(conjunction(FALSE, equality(FALSE, TRUE))))
    assert.equal(false, conjunction(equality(TRUE, FALSE), FALSE).
                        isEquivalent(conjunction(TRUE, equality(FALSE, FALSE))))
  })})
  
})

