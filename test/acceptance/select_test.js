require("./helper")

acceptanceTest("select", engine.memory, function(){

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

