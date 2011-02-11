require("../helper")

acceptanceTest("divide - relational divsion (think: opposite of cartesian join)", 
               engine.memory, function(){
  
 test("divide cartesian product by a relation", function (){
    
    allPeopleCombinedWithAllHouses = this.$R(function(){
      return join(relation("person"), relation("house"))
    }).perform()
    
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


    allPeopleCombinedWithAllHousesBackToPeople = this.$R(function(){
      return divide(join(relation("person"), relation("house")), relation("house"))
    }).perform()

    assert.relationEqual({
      name:"person__house$$house",
      attributes:["personId", "houseId", "name", "age"],
      rows:[
        [1, 101, "Jane", 5],
        [4, 103, "Amy", 6],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30]
      ]
    }, allPeopleCombinedWithAllHousesBackToPeople)
    
  })
  
  test("only populate quotient rows based on rows present in the dividend and in the divisor", function (){
    this.house.merge([
      [109, "Broderick", 1001]
    ])
    
    allPeopleCombinedWithAllHousesBackToPeople = this.$R(function(){
      return divide(
               naturalJoin(relation("person"), relation("house")), 
               select(relation("house"), eq(attr("house.address"), "Chimney Hill"))
             )
    }).perform()
     
    assert.relationEqual({
      name:"person__house$$house",
      attributes:["personId", "houseId", "name", "age"],
      rows:[
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12]
      ]
    }, allPeopleCombinedWithAllHousesBackToPeople)

  })
  
  
})