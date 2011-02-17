require("../helper")
require("knit/algorithms")

regarding("nest", function() {
  var _ = knit._util
  
  test("take flattened columns and group them up", function(){
    var relation = {attributes:["id", "color", "model", "year"], 
                    rows:[
                      [1, "red", "accord", 1984],
                      [2, "blue", "accord", 1998],
                      [3, "blue", "carrera", 1970]
                    ]}

    assert.equal(
      {attributes:["model", {"individualCars": ["id", "color", "year"]}], 
       rows:[
         ["accord", [[1, "red", 1984],
                     [2, "blue", 1998]]],
         ["carrera", [[3, "blue", 1970]]]
       ]},
      knit.algorithms.nest(relation, 
                           {"individualCars": ["id", "color", "year"]}, 
                           ["model", {"individualCars": ["id", "color", "year"]}])
    )
    
  })
  
  test("multiple levels of nesting", function(){
    var relation = {attributes:["id", "color", "model", "year", "owner"], 
                    rows:[
                      [1, "red", "accord", 1984, "Joe"],
                      [1, "red", "accord", 1984, "Nancy"],
                      [2, "blue", "accord", 1998, "Amy"],
                      [3, "blue", "carrera", 1970, "Jane"]
                    ]}

    assert.equal(
      {attributes:["model", {"individualCars": ["id", "color", "year", {"owners":["owner"]}]}], 
       rows:[
         ["accord", [[1, "red", 1984, [["Joe"],["Nancy"]] ],
                     [2, "blue", 1998, [["Amy"]] ] ]],
         ["carrera", [[3, "blue", 1970, [["Jane"]] ]] ]
       ]},
      knit.algorithms.nest(
        knit.algorithms.nest(
          relation,
          {"owners": ["owner"]},
          ["id", "color", "model", "year", {"owners":["owner"]}]
        ), 
        {"individualCars": ["id", "color", "year", {"owners":["owner"]}]}, 
        ["model", {"individualCars": ["id", "color", "year", {"owners":["owner"]}]}]
      )
    )
    
  })
  
})

