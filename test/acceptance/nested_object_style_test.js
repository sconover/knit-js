require("./helper")
var _ = require("knit/core/util")

acceptanceTest("nested object style", engine.memory, function(){
  
  test(".objects should cause nested stuff to be object-style too", function (){
    
    var nested = this.$K(function(){
      var cityHousePersonUnnested = 
        project(
          join(
            join(
              relation("city"), 
              relation("house"), 
              eq(attr("city.cityId"), attr("house.cityId"))
            ), 
            relation("person"), 
            eq(attr("house.houseId"), attr("person.houseId"))
          ), 
          attr("city.cityId", "city.name", "house.houseId", "person.personId", "person.name", "house.address", "person.age")
        )

       return order.asc(
         nest(
           nest(
             cityHousePersonUnnested, 
             attr("people", attr("person.personId", "person.name", "person.age"))
           ),
           attr("houses", attr("house.houseId", "house.address", "people"))
         ),
         attr("city.cityId")
       )
    })
    
    
    var objects = _.sortBy(nested.defaultCompiler()(nested).objects(), function(obj){return obj.cityId})
    
    assert.equal([
    
      {cityId:1001, name:"San Francisco",
       houses:[
         {houseId:101, address:"Chimney Hill",
          people:[
            {personId:1, name:"Jane", age:5},
            {personId:2, name:"Puck", age:12}
          ]},
         {houseId:102, address:"Parnassus",
          people:[
            {personId:3, name:"Fanny", age:30}
          ]}
       ]},
    
      {cityId:1002, name:"New Orleans",
       houses:[
         {houseId:103, address:"Canal",
          people:[
            {personId:4, name:"Amy", age:6}
          ]}
       ]}
    
    ], objects)
    
  })

})

