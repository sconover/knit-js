require("./helper")

acceptanceTest("project", engine.memory, engine.sqlite, function(){

  test("project a subset of attributes over the relation", function (){
    var narrowerRelation = this.$K(function(){
      return project(relation("person"), attr("person.name", "person.age"))
    })
    
    assert.relationEqual({
      name:"person",
      attributes:["name", "age"],
      rows:[
        ["Jane", 5],
        ["Puck", 12],
        ["Fanny", 30],
        ["Amy", 6]
      ]
    }, narrowerRelation)
  })
  
})