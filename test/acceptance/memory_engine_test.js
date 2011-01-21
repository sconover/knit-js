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
        mapping[attribute.name] = getAttributes(attribute.nestedRelation)
        return mapping
      } else {
        return attribute.name
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
          }).apply()
          
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
      }).apply()
      
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
      }).apply()
      
      
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
      }).apply()
      
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

      assert.equal(expected, relationContents(expression.apply()))
      assert.equal(expected, relationContents(expression.push().apply()))

      assert.equal(true, expression.apply().cost > expression.push().apply().cost)
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

      assert.equal(expected, relationContents(expression.apply()))
      assert.equal(expected, relationContents(expression.push().apply()))

      assert.equal(true, expression.apply().cost > expression.push().apply().cost)
    })
    

  })

  regarding("Order", function() {
    
    test("rows are in ascending order", function (){
      var peopleInNameOrderAscending = 
        knit(function(){
          return order.asc(person, person.attr("name"))
        }).apply()
        
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
        }).apply()
        
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
  

  regarding("Nest, unnest", function() {
    beforeEach(function() {
      simplePerson = knit(function(){return project(person, person.attr("personId", "name", "age"))}).apply()
    })
    
    regarding("Non First Normal Form to First Normal Form via unnest", function() {

      test("simple.  flattens the nested relation by distributing.", function (){
        var housePeopleNested = 
          engine.createRelation("housePeople", 
                                [house.attr("houseId"), {"people":simplePerson}, house.attr("address")]).
                                merge([
                                  [101, [[1, "Jane", 5],
                                         [2, "Puck", 12]], "Chimney Hill"],          
                                  [102, [[3, "Fanny", 30]], "Parnassus"]                                
                                ])

        assert.equal(["houseId", {"people":["personId","name","age"]}, "address"], getAttributes(housePeopleNested))

        var housePeopleUnnested = 
          knit(function(){
            return unnest(this.housePeople, this.housePeople.attr("people"))
          }, {housePeople:housePeopleNested}).apply()
                
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
        
        var housePeoplePetRows = [
          [101, "Chimney Hill", [[1, "Jane", 5, [[101, "Puck", 12]]],
                                 [2, "Tricia", 40, [[102, "Maggie", 11],
                                                    [103, "Molly", 11]] ]] ],          
          [102, "Parnassus", [[3, "Fanny", 30, [[104, "Spot", 8]] ]] ]
        ]
        
        var pet = engine.createRelation("pet", ["petId", "petName", "petAge"])
        var personWithPets = engine.createRelation("person", ["personId", "name", "age", {"pets":pet}])
        var housePeoplePet = engine.createRelation("housePeoplePet", ["houseId", "address", {"people":personWithPets}])
        housePeoplePet.merge(housePeoplePetRows)

        assert.equal({
          name:"housePeoplePet",
          attributes:["houseId", "address", {"people":["personId","name","age", {"pets":["petId", "petName", "petAge"]}]}],
          rows:housePeoplePetRows
        }, relationContents(housePeoplePet))
        
        var unnestPeopleOnly = knit(function(){return unnest(this.housePeoplePet, this.housePeoplePet.attr("people"))}, {housePeoplePet:housePeoplePet}).apply()
                        
        assert.equal({
          name:"housePeoplePet",
          attributes:["houseId", "address", "personId", "name", "age", {"pets":["petId", "petName", "petAge"]}],
          rows:[
            [101, "Chimney Hill", 1, "Jane", 5, [[101, "Puck", 12]]],
            [101, "Chimney Hill", 2, "Tricia", 40, [[102, "Maggie", 11],
                                                    [103, "Molly", 11]] ],
            [102, "Parnassus", 3, "Fanny", 30, [[104, "Spot", 8]] ]
          ]
        }, relationContents(unnestPeopleOnly))
        
        var unnestPeopleAndPet = knit(function(){return unnest(unnest(this.housePeoplePet, this.housePeoplePet.attr("people")), this.personWithPets.attr("pets"))}, {personWithPets:personWithPets, housePeoplePet:housePeoplePet}).apply()

        assert.equal({
          name:"housePeoplePet",
          attributes:["houseId", "address", "personId", "name", "age", "petId", "petName", "petAge"],
          rows:[
            [101, "Chimney Hill", 1, "Jane", 5, 101, "Puck", 12],
            [101, "Chimney Hill", 2, "Tricia", 40, 102, "Maggie", 11],
            [101, "Chimney Hill", 2, "Tricia", 40, 103, "Molly", 11],
            [102, "Parnassus", 3, "Fanny", 30, 104, "Spot", 8 ]
          ]
        }, relationContents(unnestPeopleAndPet))        
      })
      
      
    })

    regarding("Group up 'child' data into nested relations", function() {

      test("simple.  1NF to nested by matching on non-nested rows.  orders rows on flat attributes, works with intermingled nested/non-nested columns", function (){
        
        var houseToPeople_1NF = engine.createRelation("housesAndPeople", ["houseId", "personId", "name", "address", "age"])
        houseToPeople_1NF.merge([
          [101,  1, "Jane", "Chimney Hill", 5],
          [102,  3, "Fanny", "Parnassus", 30],
          [101,  2, "Puck", "Chimney Hill", 12]
        ])
        
        var houseToPerson_non1NF = knit(function(){
          return nest(
                  this.houseToPeople_1NF, 
                  {"people":this.houseToPeople_1NF.attr("personId", "name", "age")}
                )
        }, {houseToPeople_1NF:houseToPeople_1NF}).apply()

        assert.equal({
          name:"housesAndPeople",
          attributes:["houseId", {"people":["personId", "name", "age"]}, "address"],
          rows:[
            [101, [[1, "Jane", 5],
                   [2, "Puck", 12]], "Chimney Hill"],          
            [102, [[3, "Fanny", 30]], "Parnassus"]
          ]
        }, relationContents(houseToPerson_non1NF))
        
      })
    })
    
    
    test("multiple levels of nesting", function (){
      var housePeoplePet = engine.createRelation("housePeoplePet", ["houseId", "address", "personId", "name", "age", "petId", "petName", "petAge"])
      housePeoplePet.merge([
        [101, "Chimney Hill", 1, "Jane", 5, 101, "Puck", 12],
        [101, "Chimney Hill", 2, "Tricia", 40, 102, "Maggie", 11],
        [101, "Chimney Hill", 2, "Tricia", 40, 103, "Molly", 11],
        [102, "Parnassus", 3, "Fanny", 30, 104, "Spot", 8 ]
      ])
      
      var nestPetsOnly = knit(function(){
        return order.asc(nest(
                this.housePeoplePet,
                {"pets":this.housePeoplePet.attr("petId", "petName", "petAge")}                 
               ), this.housePeoplePet.attr("personId"))
      }, {housePeoplePet:housePeoplePet}).apply()
                      
      assert.equal({
        name:"housePeoplePet",
        attributes:["houseId", "address", "personId", "name", "age", {"pets":["petId", "petName", "petAge"]}],
        rows:[
          [101, "Chimney Hill", 1, "Jane", 5, [[101, "Puck", 12]]],
          [101, "Chimney Hill", 2, "Tricia", 40, [[102, "Maggie", 11],
                                                  [103, "Molly", 11]] ],
          [102, "Parnassus", 3, "Fanny", 30, [[104, "Spot", 8]] ]
        ]
      }, relationContents(nestPetsOnly))
      
      //Note that you currently can't nest nest's
      //This is a possible hole in the design.  The problem is that "pets" doesn't exist until we apply the first nest.
      //...so you can't go around referencing pets for another nest in the same apply.
      //Figure out how to make this late binding at some point...
      
      var nestPeopleInAdditionToPets = knit(function(){
        return nest(
                 this.nestPetsOnly,
                 {"people":this.nestPetsOnly.attr("personId", "name", "age", "pets")}
               )
      }, {nestPetsOnly:nestPetsOnly}).apply()
      
      assert.equal({
        name:"housePeoplePet",
        attributes:["houseId", "address", {"people":["personId","name","age", {"pets":["petId", "petName", "petAge"]}]}],
        rows:[
          [101, "Chimney Hill", [[1, "Jane", 5, [[101, "Puck", 12]]],
                                 [2, "Tricia", 40, [[102, "Maggie", 11],
                                                    [103, "Molly", 11]] ]] ],          
          [102, "Parnassus", [[3, "Fanny", 30, [[104, "Spot", 8]] ]] ]
        ]
      }, relationContents(nestPeopleInAdditionToPets))
      
      
      
    })
    
    test(".objects should cause nested stuff to be object-style too", function (){
      
      var pet = engine.createRelation("pet", ["petId", "petName", "petAge"])
      var personWithPets = engine.createRelation("person", ["personId", "name", "age", {"pets":pet}])
      var housePeoplePet = engine.createRelation("housePeoplePet", ["houseId", "address", {"people":personWithPets}])
      housePeoplePet.merge([
        [101, "Chimney Hill", [[1, "Jane", 5, [[101, "Puck", 12]]],
                               [2, "Tricia", 40, [[102, "Maggie", 11],
                                                  [103, "Molly", 11]] ]] ],          
        [102, "Parnassus", [[3, "Fanny", 30, [[104, "Spot", 8]] ]] ]
      ])
      
      assert.equal([
        {houseId:101, address:"Chimney Hill", 
          people:[
            {personId:1, name:"Jane", age:5, 
              pets:[
                {petId:101, petName:"Puck", petAge:12}
              ]},
            {personId:2, name:"Tricia", age:40, 
              pets:[
                {petId:102, petName:"Maggie", petAge:11},
                {petId:103, petName:"Molly", petAge:11}
              ]}
          ]},
        {houseId:102, address:"Parnassus", 
          people:[
            {personId:3, name:"Fanny", age:30, 
              pets:[
                {petId:104, petName:"Spot", petAge:8}
              ]}
          ]}
      ], housePeoplePet.objects())
      
    })

    
  })

  regarding("Projection", function() {

    test("project a subset of attributes over the relation", function (){
      var narrowerRelation = knit(function(){
        return project(person, person.attr("name", "age"))
      }).apply()
      
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

