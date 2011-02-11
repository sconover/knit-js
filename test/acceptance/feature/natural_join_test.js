require("../helper")

acceptanceTest("natural join", engine.memory, function(){

  test("natural join automatically creates a join predicate based on like-named columns from both tables. " +
       "in a departure from 'purity', only columns ending in Id are considered. We'll see how this goes.", function (){
    
    allPeopleCombinedWithAllHouses = this.$R(function(){
      return naturalJoin(relation("person"), relation("house"))
    }).perform()
    
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

