require("./helper")

acceptanceTest("unnest.  take grouped up 'subrows' and flatten them into the parent structure.", 
                 engine.memory, function(){

  beforeEach(function() {
    this.simplePerson = this.$R(function(){return project(relation("person"), attr("person.personId", "person.name", "person.age"))})
  })

  test("simple.  flattens the nested relation by distributing.", function (){
    var housePeopleNested = 
      this.createRelation(
        "housePeople", 
        [
         this.house.attr("houseId"), 
         {"people":this.simplePerson}, 
         this.house.attr("address")
        ]).
        merge([
          [101, [[1, "Jane", 5],
                 [2, "Puck", 12]], "Chimney Hill"],          
          [102, [[3, "Fanny", 30]], "Parnassus"]                                
        ])

    assert.equal(["houseId", {"people":["personId", "name", "age"]}, "address"], getAttributes(housePeopleNested))

    var housePeopleUnnested = 
      this.$R(function(){
        return unnest(this.housePeople, this.housePeople.attr("people"))
      }, {housePeople:housePeopleNested})
            
    assert.relationEqual({
      name:"housePeople",
      attributes:["houseId", "personId", "name", "age", "address"],
      rows:[
        [101, 1, "Jane", 5, "Chimney Hill"],
        [101, 2, "Puck", 12, "Chimney Hill"],
        [102, 3, "Fanny", 30, "Parnassus"]
      ]
    }, housePeopleUnnested)
    
  })
  
  test("multiple levels of unnesting", function (){
    var housePeople = 
      this.createRelation(
        "housePeople", 
        [
         this.house.attr("houseId"), this.house.attr("address"),
         {"people":this.simplePerson}
        ])
    
    var cityHousesPeopleNested = 
      this.createRelation(
        "cityHousesPeople", 
        [
         this.city.attr("cityId"), this.city.attr("name"), 
         {"houses":housePeople}
        ]).
        merge([
          [1001, "San Francisco", [ [101, "Chimney Hill", [[1, "Jane", 5],
                                                           [2, "Puck", 12]] ],
                                    [102, "Parnassus", [[3, "Fanny", 30]] ]   ] ],
          [1002, "New Orleans", [[103, "Canal", [[4, "Amy", 6]] ]] ]
        ])
    
    assert.equal(["cityId", "name", {"houses":["houseId", "address", {"people":["personId", "name", "age"]}]}], getAttributes(cityHousesPeopleNested))
    
    
    var unnestHousesOnly = this.$R(function(){
      return unnest(this.cityHousesPeople, this.cityHousesPeople.attr("houses"))
    }, {cityHousesPeople:cityHousesPeopleNested})
                    
    assert.relationEqual({
      name:"cityHousesPeople",
      attributes:["cityId", "name", "houseId", "address", {"people":["personId", "name", "age"]}],
      rows:[
        [1001, "San Francisco", 101, "Chimney Hill", [[1, "Jane", 5],
                                                      [2, "Puck", 12]] ],
        [1001, "San Francisco", 102, "Parnassus", [[3, "Fanny", 30]] ],
        [1002, "New Orleans", 103, "Canal", [[4, "Amy", 6]] ]
      ]
    }, unnestHousesOnly)
    
    
    var unnestHousesAndPeople = this.$R(function(){
      return unnest(
               unnest(this.cityHousesPeople, this.cityHousesPeople.attr("houses")), 
               this.housePeople.attr("people")
             )
    }, {housePeople:housePeople, cityHousesPeople:cityHousesPeopleNested})
    
    assert.relationEqual({
      name:"cityHousesPeople",
      attributes:["cityId", "name", "houseId", "address", "personId", "name", "age"],
      rows:[
        [1001, "San Francisco", 101, "Chimney Hill", 1, "Jane", 5],
        [1001, "San Francisco", 101, "Chimney Hill", 2, "Puck", 12],
        [1001, "San Francisco", 102, "Parnassus", 3, "Fanny", 30],
        [1002, "New Orleans", 103, "Canal", 4, "Amy", 6]
      ]
    }, unnestHousesAndPeople)
  })
  
})

