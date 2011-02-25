require("./helper")
require("knit/engine/memory")

regarding("readme examples", function() {
  
  test("dsl", function (){
/*
To start us off...
*/

    require("knit/engine/memory")
    
    var $R = knit({
      house:{attributes:["houseId", "address", "cityId"],
             rows:[
               [101, "Market", 1001],
               [102, "Parnassus", 1001],
               [103, "Canal", 1002]
             ]},
      city:{attributes:["cityId", "name"],
            rows:[
              [1001, "San Francisco"],
              [1002, "New Orleans"]
            ]} 
    })
    
    assert.setsEqual( //omit
    $R(function(){
      return project(
               join(relation("house"), relation("city"), 
                    eq(attr("house.cityId"), attr("city.cityId"))), 
               attr("house.address", "city.name")
             )
    }).compile().rows()
    , //omit
    /* ==>*/[
              ["Market",    "San Francisco"],
              ["Parnassus", "San Francisco"],
              ["Canal",     "New Orleans"],
            ]
    ) //omit

  })
  
})
