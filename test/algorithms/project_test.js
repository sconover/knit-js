require("../helper")
require("knit/algorithms")

regarding("project (proh-JEKT)", function() {
  var _ = knit._util,
      f = knit.algorithms
  
  test("cut down to only the specified attributes / columns", function(){
    var relation = {attributes:["id", "color", "age"], rows:[[1, "red", 5],[2, "blue", 15]]}

    assert.equal(
      {attributes:["id", "color"], rows:[[1, "red"], [2, "blue"]]},
      f.project(relation, ["id", "color"])
    )
    
    assert.equal(
      {attributes:[], rows:[[], []]},
      f.project(relation, [])
    )
  })
  
})

