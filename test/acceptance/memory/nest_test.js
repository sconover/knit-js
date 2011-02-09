require("../helper")
require("knit/engine/memory")

describe("In Memory Engine", function() {
    
  beforeEach(function() {
    knit._util.bind(setupAcceptanceFixtures, this)(knit.engine.memory.createRelation)
  })

  describe("nest.  matching on duplicate/ordered parent rows, and take the other columns and group them into 'subrows'.", function() {

    test("simple.  works with intermingled nested/non-nested columns.", function (){
      var housePersonUnnested = this.$R(function(){
        return project(
                 join(relation("house"), relation("person"), eq(attr("house.houseId"), attr("person.houseId"))), 
                 attr("house.houseId", "person.personId", "person.name", "house.address", "person.age")
               )
      }).perform()

      assert.equal({
        name:"house__person",
        attributes:["houseId", "personId", "name", "address", "age"],
        rows:[
          [101,  1, "Jane", "Chimney Hill", 5],
          [101,  2, "Puck", "Chimney Hill", 12],
          [102,  3, "Fanny", "Parnassus", 30],
          [103,  4, "Amy", "Canal", 6]
        ]
      }, relationContents(housePersonUnnested))



      var housePeopleNested = this.$R(function(){
        return order.asc(
          nest(this.housePersonUnnested, attr("people", attr("person.personId", "person.name", "person.age"))),
          attr("house.houseId")
        )
      }, {housePersonUnnested:housePersonUnnested}).perform()

      assert.equal({
        name:"house__person",
        attributes:["houseId", {"people":["personId", "name", "age"]}, "address"],
        rows:[
          [101, [[1, "Jane", 5],
                 [2, "Puck", 12]], "Chimney Hill"],          
          [102, [[3, "Fanny", 30]], "Parnassus"],
          [103, [[4, "Amy", 6]], "Canal"]
        ]
      }, relationContents(housePeopleNested))
      
    })
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
    }).perform()

    assert.equal({
      name:"city__house__person",
      attributes:["cityId", "name", "houseId", "personId", "name", "address", "age"],
      rows:[
        [1001, "San Francisco", 101, 1, "Jane", "Chimney Hill", 5],
        [1001, "San Francisco", 101, 2, "Puck", "Chimney Hill", 12],
        [1001, "San Francisco", 102, 3, "Fanny", "Parnassus", 30],
        [1002, "New Orleans", 103, 4, "Amy", "Canal", 6]
      ]
    }, relationContents(cityHousePersonUnnested))


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
    }, {cityHousePersonUnnested:cityHousePersonUnnested}).perform()

    assert.equal({
      name:"city__house__person",
      attributes:["cityId", "name", {"houses":["houseId", "address", {"people":["personId", "name", "age"]}]}],
      rows:[
        [1001, "San Francisco", [ [101, "Chimney Hill", [[1, "Jane", 5],
                                                         [2, "Puck", 12]] ],
                                  [102, "Parnassus", [[3, "Fanny", 30]] ]   ] ],
        [1002, "New Orleans", [[103, "Canal", [[4, "Amy", 6]] ]] ]
      ]
    }, relationContents(cityHousePersonNested))
    
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
    }).perform()

    assert.equal({
      name:"house__person",
      attributes:["houseId", "personId", "name", "address", "age"],
      rows:[
        [101,  1, "Jane", "Chimney Hill", 5],
        [101,  2, "Puck", "Chimney Hill", 12],
        [102,  3, "Fanny", "Parnassus", 30],
        [103,  4, "Amy", "Canal", 6],
        [104,  null, null, "Ashbury", null]
      ]
    }, relationContents(housePersonUnnested))



    var housePeopleNested = this.$R(function(){
      return order.asc(
        nest(this.housePersonUnnested, attr("people", attr("person.personId", "person.name", "person.age"))),
        attr("house.houseId")
      )
    }, {housePersonUnnested:housePersonUnnested}).perform()

    assert.equal({
      name:"house__person",
      attributes:["houseId", {"people":["personId", "name", "age"]}, "address"],
      rows:[
        [101, [[1, "Jane", 5],
               [2, "Puck", 12]], "Chimney Hill"],          
        [102, [[3, "Fanny", 30]], "Parnassus"],
        [103, [[4, "Amy", 6]], "Canal"],
        [104, [], "Ashbury"]
      ]
    }, relationContents(housePeopleNested))
    
  })
  

})

