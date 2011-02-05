require("../helper")
require("knit/engine/memory")

describe("In Memory Engine", function() {
    
  beforeEach(function() {
    knit._util.bind(setupAcceptanceFixtures, this)(new knit.engine.Memory())
    
    this.person.merge([
      [5, 104, "Felix", 10]
    ])

  })

  describe("left outer join", function() {

    test("create joined rows where the predicate matches, " +
         "or if there's no predicate match for to a row on the right, " +
         "return a joined row that consists of the row on the left with nulls on the right", function (){
      
      allPeopleCombinedWithAllHouses = this.$R(function(){
        return leftOuterJoin(relation("person"), relation("house"), equality(attr("person.houseId"), attr("house.houseId")))
      }).perform()
      
      assert.equal({
        name:"person__house",
        attributes:["personId", "houseId", "name", "age", "houseId", "address", "cityId"],
        rows:[
          [1, 101, "Jane", 5, 101, "Chimney Hill", 1001],
          [2, 101, "Puck", 12, 101, "Chimney Hill", 1001],
          [3, 102, "Fanny", 30, 102, "Parnassus", 1001],
          [4, 103, "Amy", 6, 103, "Canal", 1002],
          [5, 104, "Felix", 10, null, null, null],
        ]
      }, relationContents(allPeopleCombinedWithAllHouses))
        
    })
  })
  
  
})

