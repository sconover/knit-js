require("../test_helper.js")
require("knit/engine/memory")

regarding("In Memory Engine", function() {
    
  beforeEach(function() {
    engine = new knit.engine.Memory()

    person = engine.createRelation("person", ["personId", "houseId", "name", "age"])
    house = engine.createRelation("house", ["houseId", "address", "cityId"])
    city = engine.createRelation("city", ["cityId", "name"])

    person.merge([
      [1, 101, "Jane", 5],
      [2, 101, "Puck", 12],
      [3, 102, "Fanny", 30]
    ])
    
    house.merge([
      [101, "Chimney Hill", 1001],
      [102, "Parnassus", 1002]
    ])

    city.merge([
      [1001, "San Francisco"],
      [1002, "New Orleans"]
    ])

  })

  function relationContents(relation) {
    return {
     name:relation.name(),
     attributes:getAttributes(relation),
     rows:relation.rows()
    }
  }
  
  function getAttributes(relation) {
    return _.map(relation.attributes(), function(attribute){
      if (attribute.nestedRelation) {
        var mapping = {}
        mapping[attribute.name()] = getAttributes(attribute.nestedRelation)
        return mapping
      } else {
        return attribute.name()
      }
    })
  }

  regarding("Basics", function() {

    test("insert, read", function (){
      
      assert.equal([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30]
      ], person.rows())
      
      person.merge([
        [4, 102, "Amy", 5]
      ])

      assert.equal([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30],
        [4, 102, "Amy", 5]
      ], person.rows())
    })
    
    test("primary key - replace rows a row if it's a dup", function (){
      var person2 = engine.createRelation("person", ["personId", "houseId", "name", "age"], ["personId"])

      person2.merge([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30]
      ])
      
      assert.equal([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30]
      ], person2.rows())
      
      person2.merge([
        [1, 101, "Jeanne", 6]
      ])

      assert.equal([
        [1, 101, "Jeanne", 6],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30]
      ], person2.rows())
    })

    test("return results in js object / associative array style", function (){
      
      assert.equal([
        {personId:1, houseId:101, name:"Jane", age:5},
        {personId:2, houseId:101, name:"Puck", age:12},
        {personId:3, houseId:102, name:"Fanny", age:30}
      ], person.objects())
      
    })

    
  })

  regarding("Selection", function() {
    
    regarding("Predicates", function() {
    
      test("basic equality", function (){
        var smallerRelation = 
          knit(function(){
            return select(person, equality(person.attr("name"), "Fanny"))
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



  
  regarding("Join (cartesian)", function() {

    test("combine each row on the left with each row on the right (cartesian product)", function (){
      
      allPeopleCombinedWithAllHouses = knit(function(){
        return join(person, house)
      }).perform()
      
      assert.equal({
        name:"person__house",
        attributes:["personId", "houseId", "name", "age", 
                    "houseId", "address", "cityId"],
        rows:[
          [1, 101, "Jane", 5, 101, "Chimney Hill", 1001],
          [1, 101, "Jane", 5, 102, "Parnassus", 1002],
          [2, 101, "Puck", 12, 101, "Chimney Hill", 1001],
          [2, 101, "Puck", 12, 102, "Parnassus", 1002],
          [3, 102, "Fanny", 30, 101, "Chimney Hill", 1001],
          [3, 102, "Fanny", 30, 102, "Parnassus", 1002]
        ]
      }, relationContents(allPeopleCombinedWithAllHouses))
        
    })
    
    test("two joins", function (){

      allPeopleCombinedWithAllHousesCombinedWithAllCities = knit(function(){
        return join(join(person, house), city)
      }).perform()
      
      assert.equal({
        name:"person__house__city",
        attributes:["personId", "houseId", "name", "age", 
                    "houseId", "address", "cityId",
                    "cityId", "name"],
        rows:[
          [1, 101, "Jane", 5, 101, "Chimney Hill", 1001, 1001, "San Francisco"],
          [1, 101, "Jane", 5, 101, "Chimney Hill", 1001, 1002, "New Orleans"],
          [1, 101, "Jane", 5, 102, "Parnassus", 1002, 1001, "San Francisco"],
          [1, 101, "Jane", 5, 102, "Parnassus", 1002, 1002, "New Orleans"],
          [2, 101, "Puck", 12, 101, "Chimney Hill", 1001, 1001, "San Francisco"],
          [2, 101, "Puck", 12, 101, "Chimney Hill", 1001, 1002, "New Orleans"],
          [2, 101, "Puck", 12, 102, "Parnassus", 1002, 1001, "San Francisco"],
          [2, 101, "Puck", 12, 102, "Parnassus", 1002, 1002, "New Orleans"],
          [3, 102, "Fanny", 30, 101, "Chimney Hill", 1001, 1001, "San Francisco"],
          [3, 102, "Fanny", 30, 101, "Chimney Hill", 1001, 1002, "New Orleans"],
          [3, 102, "Fanny", 30, 102, "Parnassus", 1002, 1001, "San Francisco"],
          [3, 102, "Fanny", 30, 102, "Parnassus", 1002, 1002, "New Orleans"]
        ]
      }, relationContents(allPeopleCombinedWithAllHousesCombinedWithAllCities))

    })

    test("join predicate (YAY!)", function (){
      
      allPeopleCombinedWithAllHouses = knit(function(){
        return join(person, house, equality(person.attr("houseId"), house.attr("houseId")))
      }).perform()
      
      assert.equal({
        name:"person__house",
        attributes:["personId", "houseId", "name", "age", 
                    "houseId", "address", "cityId"],
        rows:[
          [1, 101, "Jane", 5, 101, "Chimney Hill", 1001],
          [2, 101, "Puck", 12, 101, "Chimney Hill", 1001],
          [3, 102, "Fanny", 30, 102, "Parnassus", 1002]
        ]
      }, relationContents(allPeopleCombinedWithAllHouses))
        
    })


    
  })

  regarding("Selection pushing and cost", function() {
    test("pushing in a select is less costly than leaving it outside, unnecessarily", function (){
      
      var expression = knit(function(){
        return select(join(person, house), equality(house.attr("address"), "Chimney Hill"))
      })
      
      expected = {
        name:"person__house",
        attributes:["personId", "houseId", "name", "age", 
                    "houseId", "address", "cityId"],
        rows:[
          [1, 101, "Jane", 5, 101, "Chimney Hill", 1001],
          [2, 101, "Puck", 12, 101, "Chimney Hill", 1001],
          [3, 102, "Fanny", 30, 101, "Chimney Hill", 1001]
        ]
      }

      assert.equal(expected, relationContents(expression.perform()))
      assert.equal(expected, relationContents(expression.push().perform()))

      assert.equal(true, expression.perform().cost > expression.push().perform().cost)
    })

    test("pushing in a select and making it into a join predicate is less costly than just leaving the select outside", function (){

      var expression = knit(function(){
        return select(join(person, house), equality(house.attr("houseId"), person.attr("houseId")))
      })
      
      expected = {
        name:"person__house",
        attributes:["personId", "houseId", "name", "age", 
                    "houseId", "address", "cityId"],
        rows:[
          [1, 101, "Jane", 5, 101, "Chimney Hill", 1001],
          [2, 101, "Puck", 12, 101, "Chimney Hill", 1001],
          [3, 102, "Fanny", 30, 102, "Parnassus", 1002]
        ]
      }

      assert.equal(expected, relationContents(expression.perform()))
      assert.equal(expected, relationContents(expression.push().perform()))

      assert.equal(true, expression.perform().cost > expression.push().perform().cost)
    })
    

  })

  regarding("Order", function() {
    
    test("rows are in ascending order", function (){
      var peopleInNameOrderAscending = 
        knit(function(){
          return order.asc(person, person.attr("name"))
        }).perform()
        
      assert.equal({
        name:"person",
        attributes:["personId", "houseId", "name", "age"],
        rows:[
          [3, 102, "Fanny", 30],
          [1, 101, "Jane", 5],
          [2, 101, "Puck", 12]
        ]
      }, relationContents(peopleInNameOrderAscending))
    })
              
    test("rows are in descending order", function (){
      var peopleInNameOrderDescending = 
        knit(function(){
          return order.desc(person, person.attr("name"))
        }).perform()
        
      assert.equal({
        name:"person",
        attributes:["personId", "houseId", "name", "age"],
        rows:[
          [2, 101, "Puck", 12],
          [1, 101, "Jane", 5],
          [3, 102, "Fanny", 30]
        ]
      }, relationContents(peopleInNameOrderDescending))
    })
    
          
  })
  

  regarding("nest, unnest", function() {
    beforeEach(function() {
      simplePerson = knit(function(){return project(person, person.attr("personId", "name", "age"))}).perform()
    })
    
    regarding("unnest.  take grouped up 'subrows' and flatten them into the parent structure.", function() {

      test("simple.  flattens the nested relation by distributing.", function (){
        var housePeopleNested = 
          engine.createRelation(
            "housePeople", 
            [
             house.attr("houseId"), 
             {"people":simplePerson}, 
             house.attr("address")
            ]).
            merge([
              [101, [[1, "Jane", 5],
                     [2, "Puck", 12]], "Chimney Hill"],          
              [102, [[3, "Fanny", 30]], "Parnassus"]                                
            ])

        assert.equal(["houseId", {"people":["personId", "name", "age"]}, "address"], getAttributes(housePeopleNested))

        var housePeopleUnnested = 
          knit(function(){
            return unnest(this.housePeople, this.housePeople.attr("people"))
          }, {housePeople:housePeopleNested}).perform()
                
        assert.equal({
          name:"housePeople",
          attributes:["houseId", "personId", "name", "age", "address"],
          rows:[
            [101, 1, "Jane", 5, "Chimney Hill"],
            [101, 2, "Puck", 12, "Chimney Hill"],
            [102, 3, "Fanny", 30, "Parnassus"]
          ]
        }, relationContents(housePeopleUnnested))
        
      })
      
      test("multiple levels of unnesting", function (){
        var housePeople = 
          engine.createRelation(
            "housePeople", 
            [
             house.attr("houseId"), house.attr("address"),
             {"people":simplePerson}
            ])
        
        var cityHousesPeopleNested = 
          engine.createRelation(
            "cityHousesPeople", 
            [
             city.attr("cityId"), city.attr("name"), 
             {"houses":housePeople}
            ]).
            merge([
              [1001, "San Francisco", [ [101, "Chimney Hill", [[1, "Jane", 5],
                                                               [2, "Puck", 12]] ],
                                        [102, "Parnassus", [[3, "Fanny", 30]] ]   ] ],
              [1002, "New Orleans", [[103, "Canal", [[4, "Amy", 6]] ]] ]
            ])
        
        assert.equal(["cityId", "name", {"houses":["houseId", "address", {"people":["personId", "name", "age"]}]}], getAttributes(cityHousesPeopleNested))
        
        
        var unnestHousesOnly = knit(function(){
          return unnest(this.cityHousesPeople, this.cityHousesPeople.attr("houses"))
        }, {cityHousesPeople:cityHousesPeopleNested}).perform()
                        
        assert.equal({
          name:"cityHousesPeople",
          attributes:["cityId", "name", "houseId", "address", {"people":["personId", "name", "age"]}],
          rows:[
            [1001, "San Francisco", 101, "Chimney Hill", [[1, "Jane", 5],
                                                          [2, "Puck", 12]] ],
            [1001, "San Francisco", 102, "Parnassus", [[3, "Fanny", 30]] ],
            [1002, "New Orleans", 103, "Canal", [[4, "Amy", 6]] ]
          ]
        }, relationContents(unnestHousesOnly))
        
        
        var unnestHousesAndPeople = knit(function(){
          return unnest(
                   unnest(this.cityHousesPeople, this.cityHousesPeople.attr("houses")), 
                   this.housePeople.attr("people")
                 )
        }, {housePeople:housePeople, cityHousesPeople:cityHousesPeopleNested}).perform()
        
        assert.equal({
          name:"cityHousesPeople",
          attributes:["cityId", "name", "houseId", "address", "personId", "name", "age"],
          rows:[
            [1001, "San Francisco", 101, "Chimney Hill", 1, "Jane", 5],
            [1001, "San Francisco", 101, "Chimney Hill", 2, "Puck", 12],
            [1001, "San Francisco", 102, "Parnassus", 3, "Fanny", 30],
            [1002, "New Orleans", 103, "Canal", 4, "Amy", 6]
          ]
        }, relationContents(unnestHousesAndPeople))        
      })
      
      
    })

    regarding("nest.  matching on duplicate/ordered parent rows, and take the other columns and group them into 'subrows'.", function() {

      test("simple.  works with intermingled nested/non-nested columns.", function (){
        var housePeopleUnnested = 
          engine.createRelation(
            "housePeople", 
            [house.attr("houseId"), simplePerson.attr("personId"), simplePerson.attr("name"), 
             house.attr("address"), simplePerson.attr("age")]
          ).merge([
            [101,  1, "Jane", "Chimney Hill", 5],
            [102,  3, "Fanny", "Parnassus", 30],
            [101,  2, "Puck", "Chimney Hill", 12]
          ])
        
        var housePeopleNested = knit(function(){
          return nest(
                  this.housePeople, 
                  {"people":this.housePeople.attr("personId", "name", "age")}
                )
        }, {housePeople:housePeopleUnnested}).perform()

        assert.equal({
          name:"housePeople",
          attributes:["houseId", {"people":["personId", "name", "age"]}, "address"],
          rows:[
            [101, [[1, "Jane", 5],
                   [2, "Puck", 12]], "Chimney Hill"],          
            [102, [[3, "Fanny", 30]], "Parnassus"]
          ]
        }, relationContents(housePeopleNested))
        
      })
    })
    
    
    test("multiple levels of nesting", function (){
      var cityHousePerson = 
        engine.createRelation(
          "cityHousePerson", 
          city.attr("cityId", "name").
          concat(house.attr("houseId", "address")).
          concat(simplePerson.attr("personId", "name", "age"))
        ).merge([
          [1001, "San Francisco", 101, "Chimney Hill", 1, "Jane", 5],
          [1001, "San Francisco", 101, "Chimney Hill", 2, "Puck", 12],
          [1001, "San Francisco", 102, "Parnassus", 3, "Fanny", 30],
          [1002, "New Orleans", 103, "Canal", 4, "Amy", 6]
        ])
      
      var nestPeopleOnly = knit(function(){
        return order.asc(
                 nest(
                   this.cityHousePerson, 
                   {"people":this.cityHousePerson.attr("personId", "name", "age")}
                 ),
                 this.cityHousePerson.attr("cityId")
               )
      }, {cityHousePerson:cityHousePerson}).perform()
                      
      assert.equal({
        name:"cityHousePerson",
        attributes:["cityId", "name", "houseId", "address", {"people":["personId", "name", "age"]}],
        rows:[
          [1001, "San Francisco", 101, "Chimney Hill", [[1, "Jane", 5],
                                                        [2, "Puck", 12]] ],
          [1001, "San Francisco", 102, "Parnassus", [[3, "Fanny", 30]] ],
          [1002, "New Orleans", 103, "Canal", [[4, "Amy", 6]] ]
        ]
      }, relationContents(nestPeopleOnly))
      
      //Note that you currently can't nest nest's
      //This is a possible hole in the design.  The problem is that "pets" doesn't exist until we perform the first nest.
      //...so you can't go around referencing pets for another nest in the same perform.
      //Figure out how to make this late binding at some point...

      var nestHousesAndPeople = knit(function(){
        return order.asc(
                 nest(
                   this.nestPeopleOnly, 
                   {"houses":this.nestPeopleOnly.attr("houseId", "address", "people")}
                 ),
                 this.nestPeopleOnly.attr("cityId")
               )
      }, {nestPeopleOnly:nestPeopleOnly}).perform()


      assert.equal({
        name:"cityHousePerson",
        attributes:["cityId", "name", {"houses":["houseId", "address", {"people":["personId", "name", "age"]}]}],
        rows:[
          [1001, "San Francisco", [ [101, "Chimney Hill", [[1, "Jane", 5],
                                                           [2, "Puck", 12]] ],
                                    [102, "Parnassus", [[3, "Fanny", 30]] ]   ] ],
          [1002, "New Orleans", [[103, "Canal", [[4, "Amy", 6]] ]] ]
        ]
      }, relationContents(nestHousesAndPeople))
      
      
    })
    
    test(".objects should cause nested stuff to be object-style too", function (){
      var housePeople = 
        engine.createRelation(
          "housePeople", 
          [
           house.attr("houseId"), house.attr("address"),
           {"people":simplePerson}
          ])
      
      var cityHousesPeopleNested = 
        engine.createRelation(
          "cityHousesPeople", 
          [
           city.attr("cityId"), city.attr("name"), 
           {"houses":housePeople}
          ]).
          merge([
            [1001, "San Francisco", [ [101, "Chimney Hill", [[1, "Jane", 5],
                                                             [2, "Puck", 12]] ],
                                      [102, "Parnassus", [[3, "Fanny", 30]] ]   ] ],
            [1002, "New Orleans", [[103, "Canal", [[4, "Amy", 6]] ]] ]
          ])

      var objects = cityHousesPeopleNested.objects()
      
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

  regarding("Projection", function() {

    test("project a subset of attributes over the relation", function (){
      var narrowerRelation = knit(function(){
        return project(person, person.attr("name", "age"))
      }).perform()
      
      assert.equal({
        name:"person",
        attributes:["name", "age"],
        rows:[
          ["Jane", 5],
          ["Puck", 12],
          ["Fanny", 30]
        ]
      }, relationContents(narrowerRelation))
    })
          
  })
  
  
})

