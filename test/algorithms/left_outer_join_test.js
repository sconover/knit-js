require("./helper")
require("knit/algorithms")
var _ = require("knit/core/util")

regarding("left outer join", function() {
  var colors = {attributes:["id", "color"], rows:[[1, "red"],[2, "blue"]]},
      cars = {attributes:["model"], rows:[["accord"],["carrera"],["mustang"]]}
  
  test("combine all the rows on the left with all the rows on the right (cartesian)", function(){

    assert.rawRelationEqual(
      {attributes:["id", "color", "model"], 
       rows:[
         [1, "red",  "accord"], 
         [1, "red",  "carrera"], 
         [1, "red",  "mustang"], 
         [2, "blue", "accord"],
         [2, "blue", "carrera"],
         [2, "blue", "mustang"]
       ]},
      knit.algorithms.leftOuterJoin(colors, cars)
    )
        
  })
  
  test("if a row on the left has no match on the right, return a null row on the right", function(){

    assert.rawRelationEqual(
      {attributes:["id", "color", "model"], 
       rows:[
         [1, "red",  null], 
         [2, "blue", "accord"],
         [2, "blue", "carrera"],
         [2, "blue", "mustang"]
       ]},
      knit.algorithms.leftOuterJoin(colors, cars, function(candidateRow){
        return candidateRow[1]=="blue"
      })
    )
        
  })
  
})

