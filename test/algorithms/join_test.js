require("./helper")
require("knit/algorithms")
require("../test_relation.js")

regarding("join", function() {
  var _ = knit._util,
      f = knit.algorithms
  
  test("combine all the rows on the left with all the rows on the right (cartesian)", function(){
    var colors = compiledRelation(["id", "color"], [[1, "red"],[2, "blue"]])
    var cars = compiledRelation(["model"], [["accord"],["carrera"],["mustang"]])

    assert.deepSame(
      {attributes:colors.attributes().concat(cars.attributes()), 
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
    var colors = compiledRelation(["id", "color"], [[1, "red"],[2, "blue"]])
    var cars = compiledRelation(["model"], [["accord"],["carrera"],["mustang"]])
    assert.deepSame(
      {attributes:colors.attributes().concat(cars.attributes()), 
       rows:[
         [1, "red",  "accord"], 
         [2, "blue", "accord"],
         [2, "blue", "carrera"],
         [2, "blue", "mustang"]
       ]},
      f.join(colors, cars, function(combinedAttributes, candidateRow){return candidateRow[1]=="blue" || candidateRow[2]=="accord"})
    )
        
  })
  
})

