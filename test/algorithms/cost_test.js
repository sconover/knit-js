require("./helper")
require("knit/algorithms")

regarding("cost is the number of iterations done in the course of executing an algorithm", function() {
  var _ = knit._util
  
  test("for example, select is N", function(){
    var relation = {attributes:["id", "color"], rows:[[1, "red"],[2, "blue"],[3, "blue"]]}
    assert.equal(3, knit.algorithms.select(relation, function(row){return row[1]=="blue"}).cost)
  })
    
  test("join cost", function(){
    var colors = {attributes:["id", "color"], rows:[[1, "red"],[2, "blue"]]},
        cars = {attributes:["model"], rows:[["accord"],["carrera"],["mustang"]]}
    assert.equal(8, knit.algorithms.join(colors, cars).cost)
  })
})

