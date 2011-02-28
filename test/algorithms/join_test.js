require("./helper")
var algorithm = require("knit/algorithms")
var _ = require("knit/core/util")

regarding("join", function() {
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
      algorithm.join(colors, cars)
    )
        
  })
  
  test("only return combined rows that match the predicate", function(){

    assert.rawRelationEqual(
      {attributes:["id", "color", "model"], 
       rows:[
         [1, "red",  "accord"], 
         [2, "blue", "accord"],
         [2, "blue", "carrera"],
         [2, "blue", "mustang"]
       ]},
      algorithm.join(colors, cars, function(candidateRow){
        return candidateRow[1]=="blue" || candidateRow[2]=="accord"
      })
    )
        
  })
  
})

