require("./helper")
require("knit/algorithms")
var _ = require("knit/core/util")

xregarding("aggregate", function() {
  var jogging = {attributes:["name", "miles", "minutes"], 
                 rows:[
                   ["Amy", 5, 50],
                   ["Bob", 3, 32],
                   ["Chris", 4, 60]
                 ]}

  test("apply aggregate functions across the relation", function(){
    
    assert.rawRelationEqual(
      {attributes:["sum(miles)", "sum(minutes)"], rows:[ [12, 142] ]},
      knit.algorithms.aggregate(jogging, [knit.algorithms.aggregate.sum("miles"),
                                          knit.algorithms.aggregate.sum("minutes")])
    )
      
  })

  
  regarding("the various aggregation functions", function() {
  })
  
  
})

