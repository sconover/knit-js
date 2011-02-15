require("./helper")

acceptanceTest("nest.  matching on duplicate/ordered parent rows, and take " +
                 "the other columns and group them into 'subrows'.", engine.memory, function(){
  
  test("simple.  works with intermingled nested/non-nested columns.", function (){
    var housePersonUnnested = this.$R(function(){
      return project(
               join(relation("house"), relation("person"), eq(attr("house.houseId"), attr("person.houseId"))), 
               attr("house.houseId", "person.personId", "person.name", "house.address", "person.age")
             )
    })

    assert.relationEqual({
      name:"house__person",
      attributes:["houseId", "personId", "name", "address", "age"],
      rows:[
        [101,  1, "Jane", "Chimney Hill", 5],
        [101,  2, "Puck", "Chimney Hill", 12],
        [102,  3, "Fanny", "Parnassus", 30],
        [103,  4, "Amy", "Canal", 6]
      ]
    }, housePersonUnnested)



    var housePeopleNested = this.$R(function(){
      return order.asc(
        nest(this.housePersonUnnested, attr("people", attr("person.personId", "person.name", "person.age"))),
        attr("house.houseId")
      )
    }, {housePersonUnnested:housePersonUnnested})

    assert.relationEqual({
      name:"house__person",
      attributes:["houseId", {"people":["personId", "name", "age"]}, "address"],
      rows:[
        [101, [[1, "Jane", 5],
               [2, "Puck", 12]], "Chimney Hill"],          
        [102, [[3, "Fanny", 30]], "Parnassus"],
        [103, [[4, "Amy", 6]], "Canal"]
      ]
    }, housePeopleNested)
    
  })
  
  
  test("multiple levels of nesting", function (){
    var cityHousePersonUnnested = this.$R(function(){
      return project(
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
    })

    assert.relationEqual({
      name:"city__house__person",
      attributes:["cityId", "name", "houseId", "personId", "name", "address", "age"],
      rows:[
        [1001, "San Francisco", 101, 1, "Jane", "Chimney Hill", 5],
        [1001, "San Francisco", 101, 2, "Puck", "Chimney Hill", 12],
        [1001, "San Francisco", 102, 3, "Fanny", "Parnassus", 30],
        [1002, "New Orleans", 103, 4, "Amy", "Canal", 6]
      ]
    }, cityHousePersonUnnested)


    var cityHousePersonNested = this.$R(function(){
      return order.asc(
        nest(
          nest(
            this.cityHousePersonUnnested, 
            attr("people", attr("person.personId", "person.name", "person.age"))
          ),
          attr("houses", attr("house.houseId", "house.address", "people"))
        ),
        attr("city.cityId")
      )
    }, {cityHousePersonUnnested:cityHousePersonUnnested})

    assert.relationEqual({
      name:"city__house__person",
      attributes:["cityId", "name", {"houses":["houseId", "address", {"people":["personId", "name", "age"]}]}],
      rows:[
        [1001, "San Francisco", [ [101, "Chimney Hill", [[1, "Jane", 5],
                                                         [2, "Puck", 12]] ],
                                  [102, "Parnassus", [[3, "Fanny", 30]] ]   ] ],
        [1002, "New Orleans", [[103, "Canal", [[4, "Amy", 6]] ]] ]
      ]
    }, cityHousePersonNested)
    
  })
  
  
  test("nest eliminates blank rows, so we can use this with outer joins.  " +
       "not sure whether this automatic behavior is good in the long run, one might " +
       "want this to be optional / overridable.", function (){
    
    this.house.merge([
      [104, "Ashbury", 1001]
    ])
     
    var housePersonUnnested = this.$R(function(){
      return project(
               leftOuterJoin(relation("house"), relation("person"), eq(attr("house.houseId"), attr("person.houseId"))), 
               attr("house.houseId", "person.personId", "person.name", "house.address", "person.age")
             )
    })

    assert.relationEqual({
      name:"house__person",
      attributes:["houseId", "personId", "name", "address", "age"],
      rows:[
        [101,  1, "Jane", "Chimney Hill", 5],
        [101,  2, "Puck", "Chimney Hill", 12],
        [102,  3, "Fanny", "Parnassus", 30],
        [103,  4, "Amy", "Canal", 6],
        [104,  null, null, "Ashbury", null]
      ]
    }, housePersonUnnested)



    var housePeopleNested = this.$R(function(){
      return order.asc(
        nest(this.housePersonUnnested, attr("people", attr("person.personId", "person.name", "person.age"))),
        attr("house.houseId")
      )
    }, {housePersonUnnested:housePersonUnnested})

    assert.relationEqual({
      name:"house__person",
      attributes:["houseId", {"people":["personId", "name", "age"]}, "address"],
      rows:[
        [101, [[1, "Jane", 5],
               [2, "Puck", 12]], "Chimney Hill"],          
        [102, [[3, "Fanny", 30]], "Parnassus"],
        [103, [[4, "Amy", 6]], "Canal"],
        [104, [], "Ashbury"]
      ]
    }, housePeopleNested)
    
  })
 
})

