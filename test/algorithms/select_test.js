require("../helper")
require("knit/algorithms")

regarding("select", function() {
  var _ = knit._util,
      f = knit.algorithms
  
  test("filter rows based on a predicate", function(){
    var relation = {attributes:["id", "color"], rows:[[1, "red"],[2, "blue"],[3, "blue"]]}

    assert.deepSame(
      {attributes:["id", "color"], rows:[[2, "blue"],[3, "blue"]]},
      f.select(relation, function(attributes, row){return row[1]=="blue"})
    )
    
    assert.deepSame(
      {attributes:["id", "color"], rows:[[1, "red"]]},
      f.select(relation, function(attributes, row){return row[1]=="red"})
    )
    
    assert.deepSame(
      {attributes:["id", "color"], rows:[]},
      f.select(relation, function(attributes, row){return row[1]=="PURPLE"})
    )
  })
  
})

