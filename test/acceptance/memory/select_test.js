require("../helper")
require("knit/engine/memory")

describe("In Memory Engine", function() {
    
  beforeEach(function() {
    knit._util.bind(setupAcceptanceFixtures, this)(new knit.engine.Memory())
  })

  describe("Selection", function() {
    
    describe("Predicates", function() {
    
      test("basic equality", function (){
        var smallerRelation = 
          this.$R(function(){
            return select(relation("person"), equality(attr("person.name"), "Fanny"))
          }).perform()
          
        assert.equal({
          name:"person",
          attributes:["personId", "houseId", "name", "age"],
          rows:[
            [3, 102, "Fanny", 30]
          ]
        }, relationContents(smallerRelation))
      })
      
    })
          
  })
})

