require("./helper")

acceptanceTest("order", engine.memory, engine.sqlite, function(){

  test("rows are in ascending order", function (){
    var peopleInNameOrderAscending = 
      this.$K(function(){
        return order.asc(relation("person"), attr("person.name"))
      })
      
    assert.relationEqual({
      name:"person",
      attributes:["personId", "houseId", "name", "age"],
      rows:[
        [4, 103, "Amy", 6],
        [3, 102, "Fanny", 30],
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12]
      ]
    }, peopleInNameOrderAscending)
  })
            
  test("rows are in descending order", function (){
    var peopleInNameOrderDescending = 
      this.$K(function(){
        return order.desc(relation("person"), attr("person.name"))
      })
      
    assert.relationEqual({
      name:"person",
      attributes:["personId", "houseId", "name", "age"],
      rows:[
        [2, 101, "Puck", 12],
        [1, 101, "Jane", 5],
        [3, 102, "Fanny", 30],
        [4, 103, "Amy", 6]
      ]
    }, peopleInNameOrderDescending)
  })        

})

