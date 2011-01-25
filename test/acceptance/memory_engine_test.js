require("../test_helper.js")
require("knit/engine/memory")

regarding("In Memory Engine", function() {
    
  beforeEach(function() {
    this.engine = new knit.engine.Memory()
    
    this.person = this.engine.createRelation("person", ["personId", "houseId", "name", "age"])
    this.house = this.engine.createRelation("house", ["houseId", "address", "cityId"])
    this.city = this.engine.createRelation("city", ["cityId", "name"])

    this.person.merge([
      [1, 101, "Jane", 5],
      [2, 101, "Puck", 12],
      [3, 102, "Fanny", 30],
      [4, 103, "Amy", 6]
    ])
    
    this.house.merge([
      [101, "Chimney Hill", 1001],
      [102, "Parnassus", 1001],
      [103, "Canal", 1002]
    ])

    this.city.merge([
      [1001, "San Francisco"],
      [1002, "New Orleans"]
    ])
    
    this.$R = knit.createBuilderFunction({bindings:{
      person:this.person,
      house:this.house,
      city:this.city
    }})    
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
        mapping[attribute.name()] = getAttributes(attribute.nestedRelation())
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
        [3, 102, "Fanny", 30],
        [4, 103, "Amy", 6]
      ], this.person.rows())
      
      this.person.merge([
        [5, 102, "Simon", 1]
      ])

      assert.equal([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30],
        [4, 103, "Amy", 6],
        [5, 102, "Simon", 1]
      ], this.person.rows())
    })
    
    test("primary key - replace rows a row if it's a dup", function (){
      var person2 = this.engine.createRelation("person", ["personId", "houseId", "name", "age"], ["personId"])

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
        {personId:3, houseId:102, name:"Fanny", age:30},
        {personId:4, houseId:103, name:"Amy", age:6}
      ], this.person.objects())
      
    })

    
  })

  regarding("Selection", function() {
    
    regarding("Predicates", function() {
    
      test("basic equality", function (){
        var smallerRelation = 
          this.$R(function(){
            return select(relation("person"), equality(attr("person.name"), "Fanny"))
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
      
      allPeopleCombinedWithAllHouses = this.$R(function(){
        return join(relation("person"), relation("house"))
      }).perform()
      
      assert.equal({
        name:"person__house",
        attributes:["personId", "houseId", "name", "age", "houseId", "address", "cityId"],
        rows:[
          [1, 101, "Jane", 5, 101, "Chimney Hill", 1001],
          [1, 101, "Jane", 5, 102, "Parnassus", 1001],
          [1, 101, "Jane", 5, 103, "Canal", 1002],
          [2, 101, "Puck", 12, 101, "Chimney Hill", 1001],
          [2, 101, "Puck", 12, 102, "Parnassus", 1001],
          [2, 101, "Puck", 12, 103, "Canal", 1002],
          [3, 102, "Fanny", 30, 101, "Chimney Hill", 1001],
          [3, 102, "Fanny", 30, 102, "Parnassus", 1001],
          [3, 102, "Fanny", 30, 103, "Canal", 1002],
          [4, 103, "Amy", 6, 101, "Chimney Hill", 1001],
          [4, 103, "Amy", 6, 102, "Parnassus", 1001],
          [4, 103, "Amy", 6, 103, "Canal", 1002]
        ]
      }, relationContents(allPeopleCombinedWithAllHouses))
        
    })
    
    test("two joins", function (){

      allPeopleCombinedWithAllHousesCombinedWithAllCities = this.$R(function(){
        return join(join(relation("person"), relation("house")), relation("city"))
      }).perform()

      assert.equal({
        name:"person__house__city",
        attributes:["personId", "houseId", "name", "age", "houseId", "address", "cityId", "cityId", "name"],
        rows:[
          [1, 101, "Jane", 5, 101, "Chimney Hill", 1001, 1001, "San Francisco"],
          [1, 101, "Jane", 5, 101, "Chimney Hill", 1001, 1002, "New Orleans"],
          [1, 101, "Jane", 5, 102, "Parnassus", 1001, 1001, "San Francisco"],
          [1, 101, "Jane", 5, 102, "Parnassus", 1001, 1002, "New Orleans"],
          [1, 101, "Jane", 5, 103, "Canal", 1002, 1001, "San Francisco"],
          [1, 101, "Jane", 5, 103, "Canal", 1002, 1002, "New Orleans"],          
          [2, 101, "Puck", 12, 101, "Chimney Hill", 1001, 1001, "San Francisco"],
          [2, 101, "Puck", 12, 101, "Chimney Hill", 1001, 1002, "New Orleans"],
          [2, 101, "Puck", 12, 102, "Parnassus", 1001, 1001, "San Francisco"],
          [2, 101, "Puck", 12, 102, "Parnassus", 1001, 1002, "New Orleans"],
          [2, 101, "Puck", 12, 103, "Canal", 1002, 1001, "San Francisco"],
          [2, 101, "Puck", 12, 103, "Canal", 1002, 1002, "New Orleans"],
          [3, 102, "Fanny", 30, 101, "Chimney Hill", 1001, 1001, "San Francisco"],
          [3, 102, "Fanny", 30, 101, "Chimney Hill", 1001, 1002, "New Orleans"],
          [3, 102, "Fanny", 30, 102, "Parnassus", 1001, 1001, "San Francisco"],
          [3, 102, "Fanny", 30, 102, "Parnassus", 1001, 1002, "New Orleans"],
          [3, 102, "Fanny", 30, 103, "Canal", 1002, 1001, "San Francisco"],
          [3, 102, "Fanny", 30, 103, "Canal", 1002, 1002, "New Orleans"],
          [4, 103, "Amy", 6, 101, "Chimney Hill", 1001, 1001, "San Francisco"],
          [4, 103, "Amy", 6, 101, "Chimney Hill", 1001, 1002, "New Orleans"],
          [4, 103, "Amy", 6, 102, "Parnassus", 1001, 1001, "San Francisco"],
          [4, 103, "Amy", 6, 102, "Parnassus", 1001, 1002, "New Orleans"],
          [4, 103, "Amy", 6, 103, "Canal", 1002, 1001, "San Francisco"],
          [4, 103, "Amy", 6, 103, "Canal", 1002, 1002, "New Orleans"]
        ]
      }, relationContents(allPeopleCombinedWithAllHousesCombinedWithAllCities))

    })

    test("join predicate (YAY!)", function (){
      
      allPeopleCombinedWithAllHouses = this.$R(function(){
        return join(relation("person"), relation("house"), equality(attr("person.houseId"), attr("house.houseId")))
      }).perform()
      
      assert.equal({
        name:"person__house",
        attributes:["personId", "houseId", "name", "age", "houseId", "address", "cityId"],
        rows:[
          [1, 101, "Jane", 5, 101, "Chimney Hill", 1001],
          [2, 101, "Puck", 12, 101, "Chimney Hill", 1001],
          [3, 102, "Fanny", 30, 102, "Parnassus", 1001],
          [4, 103, "Amy", 6, 103, "Canal", 1002]
        ]
      }, relationContents(allPeopleCombinedWithAllHouses))
        
    })


    
  })

  regarding("Selection pushing and cost", function() {
    test("pushing in a select is less costly than leaving it outside, unnecessarily", function (){
      
      var expression = this.$R(function(){
        return select(join(relation("person"), relation("house")), equality(attr("house.address"), "Chimney Hill"))
      })
      
      expected = {
        name:"person__house",
        attributes:["personId", "houseId", "name", "age", "houseId", "address", "cityId"],
        rows:[
          [1, 101, "Jane", 5, 101, "Chimney Hill", 1001],
          [2, 101, "Puck", 12, 101, "Chimney Hill", 1001],
          [3, 102, "Fanny", 30, 101, "Chimney Hill", 1001],
          [4, 103, "Amy", 6, 101, "Chimney Hill", 1001]
        ]
      }

      assert.equal(expected, relationContents(expression.perform()))
      assert.equal(expected, relationContents(expression.push().perform()))

      assert.equal(true, expression.perform().cost > expression.push().perform().cost)
    })

    test("pushing in a select and making it into a join predicate is less costly than just leaving the select outside", function (){

      var expression = this.$R(function(){
        return select(join(relation("person"), relation("house")), equality(attr("house.houseId"), attr("person.houseId")))
      })
      
      expected = {
        name:"person__house",
        attributes:["personId", "houseId", "name", "age", 
                    "houseId", "address", "cityId"],
        rows:[
          [1, 101, "Jane", 5, 101, "Chimney Hill", 1001],
          [2, 101, "Puck", 12, 101, "Chimney Hill", 1001],
          [3, 102, "Fanny", 30, 102, "Parnassus", 1001],
          [4, 103, "Amy", 6, 103, "Canal", 1002]
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
        this.$R(function(){
          return order.asc(relation("person"), attr("person.name"))
        }).perform()
        
      assert.equal({
        name:"person",
        attributes:["personId", "houseId", "name", "age"],
        rows:[
          [4, 103, "Amy", 6],
          [3, 102, "Fanny", 30],
          [1, 101, "Jane", 5],
          [2, 101, "Puck", 12]
        ]
      }, relationContents(peopleInNameOrderAscending))
    })
              
    test("rows are in descending order", function (){
      var peopleInNameOrderDescending = 
        this.$R(function(){
          return order.desc(relation("person"), attr("person.name"))
        }).perform()
        
      assert.equal({
        name:"person",
        attributes:["personId", "houseId", "name", "age"],
        rows:[
          [2, 101, "Puck", 12],
          [1, 101, "Jane", 5],
          [3, 102, "Fanny", 30],
          [4, 103, "Amy", 6]
        ]
      }, relationContents(peopleInNameOrderDescending))
    })
    
          
  })
  

  regarding("nest, unnest", function() {
    beforeEach(function() {
      this.simplePerson = this.$R(function(){return project(relation("person"), attr("person.personId", "person.name", "person.age"))}).perform()
    })
    
    regarding("unnest.  take grouped up 'subrows' and flatten them into the parent structure.", function() {

      test("simple.  flattens the nested relation by distributing.", function (){
        var housePeopleNested = 
          this.engine.createRelation(
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
          this.engine.createRelation(
            "housePeople", 
            [
             this.house.attr("houseId"), this.house.attr("address"),
             {"people":this.simplePerson}
            ])
        
        var cityHousesPeopleNested = 
          this.engine.createRelation(
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
        
        
        var unnestHousesAndPeople = this.$R(function(){
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
    
    test(".objects should cause nested stuff to be object-style too", function (){
      
      var nested = this.$R(function(){
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
      }).perform()
      
      
      var objects = nested.objects()
      
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
  
  
})

