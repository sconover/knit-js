require("../../test_helper")
require("knit/engine/memory")
require("knit/engine/memory/tuple_store/primary_key_based")

regarding("set tuple store - backed by a set", function() {
  
  test("stores rows, sends them all back using 'all'", function(){
    var tupleStore = new knit.engine.Memory.PrimaryKeyBasedTupleStore([], [])
    
    tupleStore.mergeSync(
      [[1,2],
       [3,4]]
    )
    
    assert.equal(
      [[1,2],
       [3,4]], tupleStore.all())
  })

  test("with no key, just append new rows", function(){
    var tupleStore = new knit.engine.Memory.PrimaryKeyBasedTupleStore([], [])
    
    tupleStore.mergeSync(
      [[1,2],
       [3,4]]
    )
    
    tupleStore.mergeSync(
      [[1,2],
       [3,4],
       [5,6]]
    )
    
    assert.equal(
      [[1,2],
       [3,4],
       [1,2],
       [3,4],
       [5,6]], tupleStore.all())
  })

  test("can have a key.  overwrites a row with a new row if the keys match.", function(){
    var tupleStore = new knit.engine.Memory.PrimaryKeyBasedTupleStore([0], [])
    
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

  test("compound key", function(){
    var tupleStore = new knit.engine.Memory.PrimaryKeyBasedTupleStore([0, 2], [])
    
    tupleStore.mergeSync(
      [[1,"a", true],
       [1,"A", false],
       [2,"b", false],
       [2,"B", false],
       [3,"c", true],
       [3,"C", true]]
    )
    
    tupleStore.mergeSync(
      [[1,"AA", true],
       [2,"BB", false]]
    )
    
    assert.equal(
      [[1,"AA", true],
       [1,"A", false],
       [2,"b", false],
       [2,"BB", false],
       [3,"c", true],
       [3,"C", true]], tupleStore.all())
  })

})
