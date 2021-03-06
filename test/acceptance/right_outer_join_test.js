require("./helper")

acceptanceTest("right outer join", engine.memory, function(){
    
  beforeEach(function() {
    this.house.merge([
      [104, "Ashbury", 1001]
    ])
  })

  test("create joined rows where the predicate matches, " +
       "or if there's no predicate match for to a row on the left, " +
       "return a joined row that consists of the row on the right with nulls on the left", function (){
    
    var allPeopleCombinedWithAllHouses = this.$K(function(){
      return rightOuterJoin(relation("person"), relation("house"), equality(attr("person.houseId"), attr("house.houseId")))
    })

    assert.relationEqual({
      name:"person__house",
      attributes:["personId", "houseId", "name", "age", "houseId", "address", "cityId"],
      rows:[
        [1, 101, "Jane", 5, 101, "Chimney Hill", 1001],
        [2, 101, "Puck", 12, 101, "Chimney Hill", 1001],
        [3, 102, "Fanny", 30, 102, "Parnassus", 1001],
        [4, 103, "Amy", 6, 103, "Canal", 1002],
        [null, null, null, null, 104, "Ashbury", 1001]
      ]
    }, allPeopleCombinedWithAllHouses)
      
  })
  
})

