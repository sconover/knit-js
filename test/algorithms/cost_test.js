require("./helper")
var algorithm = require("knit/algorithms")
var _ = require("knit/core/util")

regarding("cost is the number of iterations done in the course of executing an algorithm", function() {
  test("for example, select is N", function(){
    var relation = {attributes:["id", "color"], rows:[[1, "red"],[2, "blue"],[3, "blue"]]}
    assert.equal(3, algorithm.select(relation, function(row){return row[1]=="blue"}).cost)
  })
    
  test("join cost", function(){
    var colors = {attributes:["id", "color"], rows:[[1, "red"],[2, "blue"]]},
        cars = {attributes:["model"], rows:[["accord"],["carrera"],["mustang"]]}
    assert.equal(8, algorithm.join(colors, cars).cost)
  })
})

