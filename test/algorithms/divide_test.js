require("./helper")
var algorithm = require("knit/algorithms")
var _ = require("knit/core/util")

regarding("unnest", function() {
  var colors = {attributes:["id", "color"], rows:[[1, "red"],[2, "blue"]]},
      cars = {attributes:["model"], rows:[["accord"],["carrera"],["mustang"]]}

  test("divide cartesian product by a relation", function (){
    var joined = 
      {attributes:["id", "color", "model"], 
       rows:[
         [1, "red",  "accord"], 
         [1, "red",  "carrera"], 
         [1, "red",  "mustang"], 
         [2, "blue", "accord"],
         [2, "blue", "carrera"],
         [2, "blue", "mustang"]
       ]}
    
    assert.rawRelationEqual(colors, algorithm.divide(joined, cars))
  })

  test("only populate quotient rows based on rows present in the dividend and in the divisor", function (){
    var joined = 
      {attributes:["id", "color", "model"], 
       rows:[
         [1, "red",  "accord"], 
         [1, "red",  "carrera"], 
         [1, "red",  "mustang"], 
         [2, "blue", "accord"],
         [2, "blue", "carrera"],
         [2, "blue", "mustang"],
         [2, "green", "pinto"]
       ]}
    
    assert.rawRelationEqual(colors, algorithm.divide(joined, cars))
  })
  
  
})

