require("../helper")
require("knit/engine/memory")

describe("In Memory Engine", function() {
    
  beforeEach(function() {
    knit._util.bind(setupAcceptanceFixtures, this)(knit.engine.memory.createRelation)
  })

  describe("Selection pushing and cost", function() {
    test("pushing in a select is less costly than leaving it outside, unnecessarily", function (){
      
      var expression = this.$R(function(){
        return select(join(relation("person"), relation("house")), equality(attr("house.address"), "Chimney Hill"))
      })
      
      expected = {
        name:"person__house",
        attributes:["personId", "houseId", "name", "age", "houseId", "address", "cityId"],
        rows:[
          [1, 101, "Jane", 5, 101, "Chimney Hill", 1001],
          [2, 101, "Puck", 12, 101, "Chimney Hill", 1001],
          [3, 102, "Fanny", 30, 101, "Chimney Hill", 1001],
          [4, 103, "Amy", 6, 101, "Chimney Hill", 1001]
        ]
      }

      assert.equal(expected, relationContents(expression.perform()))
      assert.equal(expected, relationContents(expression.push().perform()))

      assert.equal(true, expression.perform().cost > expression.push().perform().cost)
    })

    test("pushing in a select and making it into a join predicate is less costly than just leaving the select outside", function (){

      var expression = this.$R(function(){
        return select(join(relation("person"), relation("house")), equality(attr("house.houseId"), attr("person.houseId")))
      })
      
      expected = {
        name:"person__house",
        attributes:["personId", "houseId", "name", "age", 
                    "houseId", "address", "cityId"],
        rows:[
          [1, 101, "Jane", 5, 101, "Chimney Hill", 1001],
          [2, 101, "Puck", 12, 101, "Chimney Hill", 1001],
          [3, 102, "Fanny", 30, 102, "Parnassus", 1001],
          [4, 103, "Amy", 6, 103, "Canal", 1002]
        ]
      }

      assert.equal(expected, relationContents(expression.perform()))
      assert.equal(expected, relationContents(expression.push().perform()))

      assert.equal(true, expression.perform().cost > expression.push().perform().cost)
    })
    

  })
})

