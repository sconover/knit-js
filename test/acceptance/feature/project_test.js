require("../helper")

acceptanceTest("project", engine.memory, function(){

  test("project a subset of attributes over the relation", function (){
    var narrowerRelation = this.$R(function(){
      return project(relation("person"), attr("person.name", "person.age"))
    }).perform()
    
    assert.equal({
      name:"person",
      attributes:["name", "age"],
      rows:[
        ["Jane", 5],
        ["Puck", 12],
        ["Fanny", 30],
        ["Amy", 6]
      ]
    }, relationContents(narrowerRelation))
  })
  
})