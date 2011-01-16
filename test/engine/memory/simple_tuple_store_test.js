require("../../test_helper")
require("knit/engine/memory/tuple_store/simple")

regarding("simple tuple store - array-based", function() {
  beforeEach(function(){
    tupleStore = new knit.engine.Memory.SimpleTupleStore()
  })
  
  test("stores rows, sends them all back using 'all'", function(){
    tupleStore.insertSync(
      [[1,2],
       [3,4]]
    )
    
    assert.equal(
      [[1,2],
       [3,4]], tupleStore.all())
  })

})
