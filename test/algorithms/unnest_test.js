require("./helper")
require("knit/algorithms")

regarding("unnest", function() {
  var _ = knit._util
  
  test("take nested columns and flatten them", function(){
    var relation = {attributes:["model", {"individualCars": ["id", "color", "year"]}], 
                    rows:[
                      ["accord", [[1, "red", 1984],
                                  [2, "blue", 1998]]],
                      ["carrera", [[3, "blue", 1970]]]
                    ]}
    
    
    assert.rawRelationEqual(
      {attributes:["model", "id", "color", "year"], 
       rows:[
         ["accord",  1, "red",  1984],
         ["accord",  2, "blue", 1998],
         ["carrera", 3, "blue",  1970]
       ]},
      knit.algorithms.unnest(relation, {"individualCars": ["id", "color", "year"]})
    )
    
  })
  
  test("multiple levels of nesting", function(){
    var relation = {attributes:["model", {"individualCars": ["id", "color", "year", {"owners":["owner"]}]}], 
                    rows:[
                      ["accord", [[1, "red", 1984, [["Joe"],["Nancy"]] ],
                                  [2, "blue", 1998, [["Amy"]] ] ]],
                      ["carrera", [[3, "blue", 1970, [["Jane"]] ]] ]
                    ]}
    
    assert.rawRelationEqual(
      {attributes:["model", "id", "color", "year", "owner"], 
       rows:[
         ["accord",  1, "red",  1984, "Joe"],
         ["accord",  1, "red",  1984, "Nancy"],
         ["accord",  2, "blue", 1998, "Amy"],
         ["carrera", 3, "blue",  1970, "Jane"]
       ]},
      knit.algorithms.unnest(
        knit.algorithms.unnest(
          relation,
          {"individualCars": ["id", "color", "year", {"owners":["owner"]}]}
        ),
        {"owners": ["owner"]}
      )
    )
    
  })
  
})

