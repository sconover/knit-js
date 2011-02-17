require("./helper")
require("knit/algorithms")
require("../test_relation.js")

regarding("select", function() {
  var _ = knit._util,
      f = knit.algorithms
  
  test("filter rows based on a predicate", function(){
    var relation = compiledRelation(["id", "color"], [[1, "red"],[2, "blue"],[3, "blue"]])

    assert.deepSame(
      {attributes:relation.attributes().get("id", "color"), rows:[[2, "blue"],[3, "blue"]]},
      f.select(relation, new knit.algebra.predicate.Equality(relation.attr("color"), "blue"))
    )
    
    assert.deepSame(
      {attributes:relation.attributes().get("id", "color"), rows:[[1, "red"]]},
      f.select(relation, new knit.algebra.predicate.Equality(relation.attr("color"), "red"))
    )

    assert.deepSame(
      {attributes:relation.attributes().get("id", "color"), rows:[]},
      f.select(relation, new knit.algebra.predicate.Equality(relation.attr("color"), "PURPLE"))
    )
  })
  
})

