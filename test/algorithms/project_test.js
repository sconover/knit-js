require("./helper")
require("knit/algorithms")
require("../test_relation.js")

regarding("project (proh-JEKT)", function() {
  var _ = knit._util,
      f = knit.algorithms
  
  test("cut down to only the specified attributes / columns", function(){
    var relation = compiledRelation(["id", "color", "age"], [[1, "red", 5],[2, "blue", 15]])

    assert.deepSame(
      {attributes:relation.attributes().get("id", "color"), rows:[[1, "red"], [2, "blue"]]},
      f.project(relation, relation.attributes().get("id", "color"))
    )
    
    assert.deepSame(
      {attributes:new knit.Attributes([]), rows:[[], []]},
      f.project(relation, new knit.Attributes([]))
    )
  })
  
})

