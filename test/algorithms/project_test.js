require("./helper")
var algorithm = require("knit/algorithms")
var _ = require("knit/core/util")

regarding("project (proh-JEKT)", function() {
  
  test("cut down to only the specified attributes / columns", function(){
    var relation = {attributes:["id", "color", "age"], rows:[[1, "red", 5],[2, "blue", 15]]}

    assert.rawRelationEqual(
      {attributes:["id", "color"], rows:[[1, "red"], [2, "blue"]]},
      algorithm.project(relation, ["id", "color"])
    )
    
    assert.rawRelationEqual(
      {attributes:[], rows:[[], []]},
      algorithm.project(relation, [])
    )
  })
  
})

