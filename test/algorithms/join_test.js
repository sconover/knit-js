require("../helper")
require("knit/algorithms")

regarding("join", function() {
  var _ = knit._util,
      f = knit.algorithms
      colors = {attributes:["id", "color"], rows:[[1, "red"],[2, "blue"]]},
      cars = {attributes:["model"], rows:[["accord"],["carrera"],["mustang"]]}
  
  test("combine all the rows on the left with all the rows on the right (cartesian)", function(){

    assert.deepSame(
      {attributes:["id", "color", "model"], 
       rows:[
         [1, "red",  "accord"], 
         [1, "red",  "carrera"], 
         [1, "red",  "mustang"], 
         [2, "blue", "accord"],
         [2, "blue", "carrera"],
         [2, "blue", "mustang"]
       ]},
      f.join(colors, cars)
    )
        
  })
  
  test("only return combined rows that match the predicate", function(){

    assert.deepSame(
      {attributes:["id", "color", "model"], 
       rows:[
         [1, "red",  "accord"], 
         [2, "blue", "accord"],
         [2, "blue", "carrera"],
         [2, "blue", "mustang"]
       ]},
      f.join(colors, cars, function(combinedAttributes, candidateRow){
        return candidateRow[_.indexOf(combinedAttributes, "color")]=="blue" || 
               candidateRow[_.indexOf(combinedAttributes, "model")]=="accord"
      })
    )
        
  })
  
})

