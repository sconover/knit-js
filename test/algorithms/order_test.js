require("./helper")
require("knit/algorithms")
var _ = require("knit/core/util")

regarding("order", function() {
  
  test("order rows by an attribute and direction", function(){
    var relation = {attributes:["id", "color"], rows:[[1, "red"],[2, "blue"],[3, "green"]]}

    assert.rawRelationEqual(
      {attributes:["id", "color"], rows:[[2, "blue"],[3, "green"],[1, "red"]]},
      knit.algorithms.orderAsc(relation, "color")
    )
    
    assert.rawRelationEqual(
      {attributes:["id", "color"], rows:[[1, "red"],[3, "green"],[2, "blue"]]},
      knit.algorithms.orderDesc(relation, "color")
    )
    
  })
  
})

