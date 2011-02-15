require("./helper")

acceptanceTest("select", engine.memory, engine.sqlite, function(){

  describe("Predicates", function() {
  
    test("basic equality", function (){
      var smallerRelation = 
        this.$R(function(){
          return select(relation("person"), eq(attr("person.name"), "Fanny"))
        })
        
      assert.relationEqual({
        name:"person",
        attributes:["personId", "houseId", "name", "age"],
        rows:[
          [3, 102, "Fanny", 30]
        ]
      }, smallerRelation)
    })
    
    test("conjunction / and", function (){
      var smallerRelation = 
        this.$R(function(){
          return select(relation("person"), and(eq(attr("person.houseId"), 101), eq(attr("person.age"), 5)))
        })
        
      assert.relationEqual({
        name:"person",
        attributes:["personId", "houseId", "name", "age"],
        rows:[
          [1, 101, "Jane", 5]
        ]
      }, smallerRelation)
    })
    
  })
  
})

