require("../test_helper.js")
require("knit/function/predicate")

regarding("predicates", function() {
    
  test("sameness", function (){knit(function(){
    assert.equal(true, TRUE.isSame(TRUE))
    assert.equal(false, TRUE.isSame(FALSE))
    assert.equal(true, FALSE.isSame(FALSE))
    assert.equal(false, FALSE.isSame(TRUE))
    
    assert.equal(true, equality(TRUE, FALSE).isSame(equality(TRUE, FALSE)))
    assert.equal(false, equality(TRUE, FALSE).isSame(equality(TRUE, TRUE)))
    
    assert.equal(true, conjunction(TRUE, FALSE).isSame(conjunction(TRUE, FALSE)))
    assert.equal(false, conjunction(TRUE, FALSE).isSame(conjunction(TRUE, TRUE)))
  })})  
  
  xtest("splitting", function (){
    join = knit(function(){return join(person, house)})
  })  
  
})

