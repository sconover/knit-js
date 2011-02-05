require("../helper")
require("knit/engine/memory")

describe("In Memory Engine", function() {
    
  beforeEach(function() {
    knit.bind(setupAcceptanceFixtures, this)(new knit.engine.Memory())
  })

  describe("Order", function() {
    
    test("rows are in ascending order", function (){
      var peopleInNameOrderAscending = 
        this.$R(function(){
          return order.asc(relation("person"), attr("person.name"))
        }).perform()
        
      assert.equal({
        name:"person",
        attributes:["personId", "houseId", "name", "age"],
        rows:[
          [4, 103, "Amy", 6],
          [3, 102, "Fanny", 30],
          [1, 101, "Jane", 5],
          [2, 101, "Puck", 12]
        ]
      }, relationContents(peopleInNameOrderAscending))
    })
              
    test("rows are in descending order", function (){
      var peopleInNameOrderDescending = 
        this.$R(function(){
          return order.desc(relation("person"), attr("person.name"))
        }).perform()
        
      assert.equal({
        name:"person",
        attributes:["personId", "houseId", "name", "age"],
        rows:[
          [2, 101, "Puck", 12],
          [1, 101, "Jane", 5],
          [3, 102, "Fanny", 30],
          [4, 103, "Amy", 6]
        ]
      }, relationContents(peopleInNameOrderDescending))
    })        
    
  })
  
})

