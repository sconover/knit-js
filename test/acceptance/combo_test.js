require("./helper")

acceptanceTest("join and project", engine.memory, engine.sqlite, function(){
  
  test("a join with a project", function (){
    
    var combo = this.$K(function(){
      return project(
               join(relation("person"), relation("house"), 
                    eq(attr("person.houseId"), attr("house.houseId"))),
               attr("person.name", "house.address")
             )
    })
    
    assert.relationEqual({
      name:"person__house",
      attributes:["name", "address"],
      rows:[
        ["Jane",  "Chimney Hill"],
        ["Puck",  "Chimney Hill"],
        ["Fanny", "Parnassus"],
        ["Amy",   "Canal"]
      ]
    }, combo)
      
  })
  
})