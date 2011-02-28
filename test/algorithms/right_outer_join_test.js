require("./helper")
require("knit/algorithms")
var _ = require("knit/core/util")

regarding("right outer join", function() {
  var colors = {attributes:["id", "color"], rows:[[1, "red"],[2, "blue"]]},
      cars = {attributes:["model"], rows:[["accord"],["carrera"],["mustang"]]}
  
  test("combine all the rows on the left with all the rows on the right (cartesian)", function(){

    assert.rawRelationEqual(
      {attributes:["id", "color", "model"], 
       rows:[
         [1, "red",  "accord"], 
         [2, "blue", "accord"],
         [1, "red",  "carrera"], 
         [2, "blue", "carrera"],
         [1, "red",  "mustang"], 
         [2, "blue", "mustang"]
       ]},
      knit.algorithms.rightOuterJoin(colors, cars)
    )
        
  })
  
  test("if a row on the right has no match on the left, return a null row on the left", function(){

    assert.rawRelationEqual(
      {attributes:["id", "color", "model"], 
       rows:[
         [1, "red", "accord"],
         [2, "blue", "accord"],
         [null, null, "carrera"],
         [null, null, "mustang"]
       ]},
      knit.algorithms.rightOuterJoin(colors, cars, function(candidateRow){
        return candidateRow[2]=="accord"
      })
    )
        
  })
  
})

