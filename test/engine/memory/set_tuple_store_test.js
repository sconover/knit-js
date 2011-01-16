require("../../test_helper")
require("knit/engine/memory")
require("knit/engine/memory/tuple_store/set")

regarding("set tuple store - backed by a set", function() {
  
  test("stores rows, sends them all back using 'all'", function(){
    var tupleStore = new knit.engine.Memory.SetTupleStore([], [])
    
    tupleStore.mergeSync(
      [[1,2],
       [3,4]]
    )
    
    assert.equal(
      [[1,2],
       [3,4]], tupleStore.all())
  })

  test("can have a key.  overwrites a row with a new row if the keys match.", function(){
    var tupleStore = new knit.engine.Memory.SetTupleStore([0], [])
    
    tupleStore.mergeSync(
      [[1,"a"],
       [2,"b"],
       [3,"c"]]
    )
    
    tupleStore.mergeSync(
      [[1,"A"],
       [2,"B"]]
    )
    
    assert.equal(
      [[1,"A"],
       [2,"B"],
       [3,"c"]], tupleStore.all())
  })

})
