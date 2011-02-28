require("./helper")
var algorithm = require("knit/algorithms")
var _ = require("knit/core/util")

regarding("select", function() {
  
  test("filter rows based on a predicate", function(){
    var relation = {attributes:["id", "color"], rows:[[1, "red"],[2, "blue"],[3, "blue"]]}

    assert.rawRelationEqual(
      {attributes:["id", "color"], rows:[[2, "blue"],[3, "blue"]]},
      algorithm.select(relation, function(row){return row[1]=="blue"})
    )
    
    assert.rawRelationEqual(
      {attributes:["id", "color"], rows:[[1, "red"]]},
      algorithm.select(relation, function(row){return row[1]=="red"})
    )
    
    assert.rawRelationEqual(
      {attributes:["id", "color"], rows:[]},
      algorithm.select(relation, function(row){return row[1]=="PURPLE"})
    )
  })
  
})

