require("./helper")
require("knit/algorithms")

regarding("natural join - join on common column names", function() {
  var _ = knit._util
  
  test("combine all the rows on the left with all the rows on the right (cartesian)", function(){
    var colors = {attributes:["colorId", "color"], rows:[[1, "red"],[2, "blue"],[3,"green"]]},
        cars = {attributes:["model", "colorId"], rows:[["accord", 1],["carrera", 999],["mustang", 2]]}
    
    assert.rawRelationEqual(
      {attributes:["colorId", "color", "model", "colorId"], 
       rows:[
         [1, "red",  "accord", 1], 
         [2, "blue", "mustang", 2]
       ]},
      knit.algorithms.naturalJoin(colors, cars)
    )
        
  })
  
  test("only consider joining on attributes with a certain suffix", function(){

    var colors = {attributes:["colorId", "color"], rows:[[1, "red"],[2, "blue"],[3,"green"]]},
        cars = {attributes:["model", "colorId", "color"], rows:[["accord", 1, "red"],["carrera", 999, "red"],["mustang", 2, "red"]]}
    
    assert.rawRelationEqual(
      {attributes:["colorId", "color", "model", "colorId", "color"], 
       rows:[
         [1, "red",  "accord", 1, "red"], 
         [2, "blue", "mustang", 2, "red"]
       ]},
      knit.algorithms.naturalJoin(colors, cars, "Id")
    )
        
  })
  
  
  //FQ attrs where two attrs match that are excluded by suffix
  
})

