require("./helper")
require("knit/engine/memory")
require("knit/engine/sqlite")

regarding("readme examples", function() {
  
  test("dsl", function (){
/*
Quick start:
1) Create a couple of in-memory relations.
2) Join them on cityId, and project the resulting relation down to house address and city name.
*/

    //aside: http://aresemicolonsnecessaryinjavascript.com
    
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
    
    //If you're new to RA but familiar with SQL, think:
    //  select house.address, city.name
    //  from house join city on house.cityId = city.cityId
    
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
              ["Canal",     "New Orleans"]
            ]
    ) //omit

/*
This should provide a good flavor of what's possible with pure relational algebra.
Rather than expressing relational operations as a big blob of sql:

    select house.address, city.name from house join city on house.cityId = city.cityId
    
Each operation is itself a composable relation.

The following are all valid relations, with sql equivalents:

    relation("house") 
      //select * from house
    
    relation("city") 
      //select * from city
    
    join(relation("house"), relation("city")) 
      //cartesian join: select * from house join city
    
    project(relation("house"), attr("house.houseId", "house.address"))
      //select house.houseId, house.address from house
*/


  })


  test("sqlite", function (){ 
    
/*
The same example, using RDB storage.  Makes use of knit's *very alpha* sqlite support.
*/
    

    var db = new knit.engine.sqlite.Database(":memory:")
    db.open()
    
    
    //create a couple of tables, with rows
    
    var house = knit.engine.sqlite.Table.create(
                  db, 
                  "house", 
                  [["houseId", knit.attributeType.Integer], 
                   ["address", knit.attributeType.String], 
                   ["cityId",  knit.attributeType.Integer]], 
                  ["houseId"]
                ).merge([
                  [101, "Market", 1001],
                  [102, "Parnassus", 1001],
                  [103, "Canal", 1002]                
                ])
        
    var city = knit.engine.sqlite.Table.create(
                 db, 
                 "city", 
                 [["cityId",  knit.attributeType.Integer], 
                  ["name",    knit.attributeType.String]], 
                 ["cityId"]
               ).merge([
                 [1001, "San Francisco"],
                 [1002, "New Orleans"]
               ])
    
    var $R = knit({bindings:{city:city, house:house}})
    
    
    //join and project as in the first example
    
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
              ["Canal",     "New Orleans"]
            ]
    ) //omit

    db.close()
  })
})
