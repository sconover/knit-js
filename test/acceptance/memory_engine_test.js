require("../test_helper.js")
require("knit/engine/memory")

regarding("In Memory Engine", function () {
    
  beforeEach(function() {
    engine = new knit.engine.Memory()

    person = engine.createRelation("person", ["id", "houseId", "name", "age"])
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
     attributes:_.map(relation.attributes(), function(attribute){return attribute.name}),
     tuples:relation.rows()
    }
  }

  regarding("Basics", function () {

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
      var person2 = engine.createRelation("person", ["id", "houseId", "name", "age"], ["id"])

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
        {id:1, houseId:101, name:"Jane", age:5},
        {id:2, houseId:101, name:"Puck", age:12},
        {id:3, houseId:102, name:"Fanny", age:30}
      ], person.objects())
      
    })

    
  })

  regarding("Selection", function () {
    
    regarding("Predicates", function () {
    
      test("basic equality", function (){
        var smallerRelation = 
          knit(function(){
            return select(person, equality(person.attr("name"), "Fanny"))
          }).apply()
          
        assert.equal({
          name:"person",
          attributes:["id", "houseId", "name", "age"],
          tuples:[
            [3, 102, "Fanny", 30]
          ]
        }, relationContents(smallerRelation))
      })
      
    })
          
  })



  
  regarding("Join (cartesian)", function () {

    test("combine each row on the left with each row on the right (cartesian product)", function (){
      
      allPeopleCombinedWithAllHouses = knit(function(){
        return join(person, house)
      }).apply()
      
      assert.equal({
        name:"person__house",
        attributes:["id", "houseId", "name", "age", 
                    "houseId", "address", "cityId"],
        tuples:[
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
        attributes:["id", "houseId", "name", "age", 
                    "houseId", "address", "cityId",
                    "cityId", "name"],
        tuples:[
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
        attributes:["id", "houseId", "name", "age", 
                    "houseId", "address", "cityId"],
        tuples:[
          [1, 101, "Jane", 5, 101, "Chimney Hill", 1001],
          [2, 101, "Puck", 12, 101, "Chimney Hill", 1001],
          [3, 102, "Fanny", 30, 102, "Parnassus", 1002]
        ]
      }, relationContents(allPeopleCombinedWithAllHouses))
        
    })


    
  })

  regarding("Selection pushing and cost", function () {
    test("pushing in a select is less costly than leaving it outside, unnecessarily", function (){
      
      expression = knit(function(){
        return select(join(person, house), equality(house.attr("address"), "Chimney Hill"))
      })
      
      expected = {
        name:"person__house",
        attributes:["id", "houseId", "name", "age", 
                    "houseId", "address", "cityId"],
        tuples:[
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

      expression = knit(function(){
        return select(join(person, house), equality(house.attr("houseId"), person.attr("houseId")))
      })
      
      expected = {
        name:"person__house",
        attributes:["id", "houseId", "name", "age", 
                    "houseId", "address", "cityId"],
        tuples:[
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

  xregarding("Projection", function () {

    test("project a subset of attributes over the relation", function (){

      smallerRelation = engine.project(person, person.attributes().get("name", "age"))

      assert.equal({
        name:"person",
        attributes:["name", "age"],
        tuples:[
          ["Jane", 5],
          ["Puck", 12],
          ["Fanny", 30]
        ]
      }, relationContents(smallerRelation))
    })
          
  })
  
  
})

