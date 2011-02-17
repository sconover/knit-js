require("../helper")
require("knit/algorithms")

regarding("right outer join", function() {
  var _ = knit._util,
      f = knit.algorithms
      colors = {attributes:["id", "color"], rows:[[1, "red"],[2, "blue"]]},
      cars = {attributes:["model"], rows:[["accord"],["carrera"],["mustang"]]}
  
  test("combine all the rows on the left with all the rows on the right (cartesian)", function(){

    assert.equal(
      {attributes:["id", "color", "model"], 
       rows:[
         [1, "red",  "accord"], 
         [2, "blue", "accord"],
         [1, "red",  "carrera"], 
         [2, "blue", "carrera"],
         [1, "red",  "mustang"], 
         [2, "blue", "mustang"]
       ]},
      f.rightOuterJoin(colors, cars)
    )
        
  })
  
  test("if a row on the right has no match on the left, return a null row on the left", function(){

    assert.equal(
      {attributes:["id", "color", "model"], 
       rows:[
         [1, "red", "accord"],
         [2, "blue", "accord"],
         [null, null, "carrera"],
         [null, null, "mustang"]
       ]},
      f.rightOuterJoin(colors, cars, function(candidateRow){
        return candidateRow[2]=="accord"
      })
    )
        
  })
  
})

