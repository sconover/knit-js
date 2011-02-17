require("../helper")
require("knit/algorithms")

regarding("select", function() {
  var _ = knit._util
  
  test("filter rows based on a predicate", function(){
    var relation = {attributes:["id", "color"], rows:[[1, "red"],[2, "blue"],[3, "blue"]]}

    assert.equal(
      {attributes:["id", "color"], rows:[[2, "blue"],[3, "blue"]]},
      knit.algorithms.select(relation, function(row){return row[1]=="blue"})
    )
    
    assert.equal(
      {attributes:["id", "color"], rows:[[1, "red"]]},
      knit.algorithms.select(relation, function(row){return row[1]=="red"})
    )
    
    assert.equal(
      {attributes:["id", "color"], rows:[]},
      knit.algorithms.select(relation, function(row){return row[1]=="PURPLE"})
    )
  })
  
})

