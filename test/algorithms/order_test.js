require("../helper")
require("knit/algorithms")

regarding("order", function() {
  var _ = knit._util,
      f = knit.algorithms
  
  test("order rows by an attribute and direction", function(){
    var relation = {attributes:["id", "color"], rows:[[1, "red"],[2, "blue"],[3, "green"]]}

    assert.equal(
      {attributes:["id", "color"], rows:[[2, "blue"],[3, "green"],[1, "red"]]},
      f.orderAsc(relation, "color")
    )
    
    assert.equal(
      {attributes:["id", "color"], rows:[[1, "red"],[3, "green"],[2, "blue"]]},
      f.orderDesc(relation, "color")
    )
    
  })
  
})

