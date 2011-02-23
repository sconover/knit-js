require("./helper")
require("knit/algorithms")

regarding("order", function() {
  var _ = knit._util
  
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

