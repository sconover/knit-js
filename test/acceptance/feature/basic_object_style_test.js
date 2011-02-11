require("../helper")

acceptanceTest("basic object style", engine.memory, engine.sqlite, function(){

  test("return results in js object / associative array style", function (){
    
    assert.setsEqual([
      {personId:1, houseId:101, name:"Jane", age:5},
      {personId:2, houseId:101, name:"Puck", age:12},
      {personId:3, houseId:102, name:"Fanny", age:30},
      {personId:4, houseId:103, name:"Amy", age:6}
    ], this.person.objects())
    
  })

})

