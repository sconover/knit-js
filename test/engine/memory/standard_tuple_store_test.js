require("../../test_helper")
require("knit/engine/memory")
require("knit/engine/memory/standard_row_store")

regarding("set row store - backed by a set", function() {
  
  test("stores rows, sends them all back using 'all'", function(){
    var rowStore = new knit.engine.Memory.StandardRowStore([], [])
    
    rowStore.merge(
      [[1,2],
       [3,4]]
    )
    
    assert.equal(
      [[1,2],
       [3,4]], rowStore.rows())
  })

  test("with no key, just append new rows", function(){
    var rowStore = new knit.engine.Memory.StandardRowStore([], [])
    
    rowStore.merge(
      [[1,2],
       [3,4]]
    )
    
    rowStore.merge(
      [[1,2],
       [3,4],
       [5,6]]
    )
    
    assert.equal(
      [[1,2],
       [3,4],
       [1,2],
       [3,4],
       [5,6]], rowStore.rows())
  })

  test("can have a key.  overwrites a row with a new row if the keys match.", function(){
    var rowStore = new knit.engine.Memory.StandardRowStore([0], [])
    
    rowStore.merge(
      [[1,"a"],
       [2,"b"],
       [3,"c"]]
    )
    
    rowStore.merge(
      [[1,"A"],
       [2,"B"]]
    )
    
    assert.equal(
      [[1,"A"],
       [2,"B"],
       [3,"c"]], rowStore.rows())
  })

  test("compound key", function(){
    var rowStore = new knit.engine.Memory.StandardRowStore([0, 2], [])
    
    rowStore.merge(
      [[1,"a", true],
       [1,"A", false],
       [2,"b", false],
       [2,"B", false],
       [3,"c", true],
       [3,"C", true]]
    )
    
    rowStore.merge(
      [[1,"AA", true],
       [2,"BB", false]]
    )
    
    assert.equal(
      [[1,"AA", true],
       [1,"A", false],
       [2,"b", false],
       [2,"BB", false],
       [3,"c", true],
       [3,"C", true]], rowStore.rows())
  })

})
