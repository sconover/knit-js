require("./helper")

acceptanceTest("join", engine.memory, function(){

  test("combine each row on the left with each row on the right (cartesian product)", function (){
    
    allPeopleCombinedWithAllHouses = this.$R(function(){
      return join(relation("person"), relation("house"))
    })
    
    assert.relationEqual({
      name:"person__house",
      attributes:["personId", "houseId", "name", "age", "houseId", "address", "cityId"],
      rows:[
        [1, 101, "Jane", 5, 101, "Chimney Hill", 1001],
        [1, 101, "Jane", 5, 102, "Parnassus", 1001],
        [1, 101, "Jane", 5, 103, "Canal", 1002],
        [2, 101, "Puck", 12, 101, "Chimney Hill", 1001],
        [2, 101, "Puck", 12, 102, "Parnassus", 1001],
        [2, 101, "Puck", 12, 103, "Canal", 1002],
        [3, 102, "Fanny", 30, 101, "Chimney Hill", 1001],
        [3, 102, "Fanny", 30, 102, "Parnassus", 1001],
        [3, 102, "Fanny", 30, 103, "Canal", 1002],
        [4, 103, "Amy", 6, 101, "Chimney Hill", 1001],
        [4, 103, "Amy", 6, 102, "Parnassus", 1001],
        [4, 103, "Amy", 6, 103, "Canal", 1002]
      ]
    }, allPeopleCombinedWithAllHouses)
      
  })
  
  test("two joins", function (){

    allPeopleCombinedWithAllHousesCombinedWithAllCities = this.$R(function(){
      return join(join(relation("person"), relation("house")), relation("city"))
    })

    assert.relationEqual({
      name:"person__house__city",
      attributes:["personId", "houseId", "name", "age", "houseId", "address", "cityId", "cityId", "name"],
      rows:[
        [1, 101, "Jane", 5, 101, "Chimney Hill", 1001, 1001, "San Francisco"],
        [1, 101, "Jane", 5, 101, "Chimney Hill", 1001, 1002, "New Orleans"],
        [1, 101, "Jane", 5, 102, "Parnassus", 1001, 1001, "San Francisco"],
        [1, 101, "Jane", 5, 102, "Parnassus", 1001, 1002, "New Orleans"],
        [1, 101, "Jane", 5, 103, "Canal", 1002, 1001, "San Francisco"],
        [1, 101, "Jane", 5, 103, "Canal", 1002, 1002, "New Orleans"],          
        [2, 101, "Puck", 12, 101, "Chimney Hill", 1001, 1001, "San Francisco"],
        [2, 101, "Puck", 12, 101, "Chimney Hill", 1001, 1002, "New Orleans"],
        [2, 101, "Puck", 12, 102, "Parnassus", 1001, 1001, "San Francisco"],
        [2, 101, "Puck", 12, 102, "Parnassus", 1001, 1002, "New Orleans"],
        [2, 101, "Puck", 12, 103, "Canal", 1002, 1001, "San Francisco"],
        [2, 101, "Puck", 12, 103, "Canal", 1002, 1002, "New Orleans"],
        [3, 102, "Fanny", 30, 101, "Chimney Hill", 1001, 1001, "San Francisco"],
        [3, 102, "Fanny", 30, 101, "Chimney Hill", 1001, 1002, "New Orleans"],
        [3, 102, "Fanny", 30, 102, "Parnassus", 1001, 1001, "San Francisco"],
        [3, 102, "Fanny", 30, 102, "Parnassus", 1001, 1002, "New Orleans"],
        [3, 102, "Fanny", 30, 103, "Canal", 1002, 1001, "San Francisco"],
        [3, 102, "Fanny", 30, 103, "Canal", 1002, 1002, "New Orleans"],
        [4, 103, "Amy", 6, 101, "Chimney Hill", 1001, 1001, "San Francisco"],
        [4, 103, "Amy", 6, 101, "Chimney Hill", 1001, 1002, "New Orleans"],
        [4, 103, "Amy", 6, 102, "Parnassus", 1001, 1001, "San Francisco"],
        [4, 103, "Amy", 6, 102, "Parnassus", 1001, 1002, "New Orleans"],
        [4, 103, "Amy", 6, 103, "Canal", 1002, 1001, "San Francisco"],
        [4, 103, "Amy", 6, 103, "Canal", 1002, 1002, "New Orleans"]
      ]
    }, allPeopleCombinedWithAllHousesCombinedWithAllCities)

  })

  test("join predicate (YAY!)", function (){
    
    allPeopleCombinedWithAllHouses = this.$R(function(){
      return join(relation("person"), relation("house"), equality(attr("person.houseId"), attr("house.houseId")))
    })
    
    assert.relationEqual({
      name:"person__house",
      attributes:["personId", "houseId", "name", "age", "houseId", "address", "cityId"],
      rows:[
        [1, 101, "Jane", 5, 101, "Chimney Hill", 1001],
        [2, 101, "Puck", 12, 101, "Chimney Hill", 1001],
        [3, 102, "Fanny", 30, 102, "Parnassus", 1001],
        [4, 103, "Amy", 6, 103, "Canal", 1002]
      ]
    }, allPeopleCombinedWithAllHouses)
      
  })
  
})