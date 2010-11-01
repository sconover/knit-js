require("../test_helper.js")
require("knit/engine/memory")


//test cost...a relative measure.  prove this out, then test joining.  
//should be able to to a naive implementation of natural join,
//then throw in relation optimization, and cost asserts should go green

regarding("In Memory Engine", function () {
    
  beforeEach(function() {
    engine = new knit.engine.Memory()

    person = engine.createRelation("person", ["id", "house_id", "name", "age"])
    house = engine.createRelation("house", ["house_id", "address", "city_id"])
    city = engine.createRelation("city", ["city_id", "name"])
  })

  function relationContents(relation) {
    return {
     name:relation.name,
     attributes:_.map(relation.attributes, function(attribute){return attribute.name}),
     tuples:relation.tuplesSync()
    }
  }

  regarding("Basics", function () {

    test("insert, read", function (){
      person.insertSync([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12]
      ])
      
      assert.equal([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12]
      ], person.tuplesSync())
      
      person.insertSync([
        [3, 102, "Fanny", 30]
      ])

      assert.equal([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30]
      ], person.tuplesSync())
    })
    
  })

  regarding("Selection", function () {
    
    regarding("Predicates", function () {
    
      test("basic equality", function (){
        person.insertSync([
          [1, 101, "Jane", 5],
          [2, 101, "Puck", 12],
          [3, 102, "Fanny", 30]
        ])
      	
				var smallerRelation = 
					knit(function(){
						return select(person, equality(person.attr("name"), "Fanny"))
					}).apply()
					
        assert.equal({
          name:"person",
          attributes:["id", "house_id", "name", "age"],
          tuples:[
            [3, 102, "Fanny", 30]
          ]
        }, relationContents(smallerRelation))
      })
      
    })
          
  })



  
  regarding("Join (cartesian)", function () {

    test("combine each row on the left with each row on the right (cartesian product)", function (){
      
      person.insertSync([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30]
      ])
      
      house.insertSync([
        [101, "Chimney Hill", 1001],
        [102, "Parnassus", 1002]
      ])
      
      allPeopleCombinedWithAllHouses = knit(function(){
	      return join(person, house)
	    }).apply()
      
      assert.equal({
        name:"person__house",
        attributes:["id", "house_id", "name", "age", 
                    "house_id", "address", "city_id"],
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

      person.insertSync([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30]
      ])
      
      house.insertSync([
        [101, "Chimney Hill", 1001],
        [102, "Parnassus", 1002]
      ])

      city.insertSync([
        [1001, "San Francisco"],
        [1002, "New Orleans"]
      ])

      allPeopleCombinedWithAllHousesCombinedWithAllCities = knit(function(){
	      return join(join(person, house), city)
	    }).apply()
      
      
      assert.equal({
        name:"person__house__city",
        attributes:["id", "house_id", "name", "age", 
                    "house_id", "address", "city_id",
                    "city_id", "name"],
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
      
      person.insertSync([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30]
      ])
      
      house.insertSync([
        [101, "Chimney Hill", 1001],
        [102, "Parnassus", 1002]
      ])
      
      allPeopleCombinedWithAllHouses = knit(function(){
	      return join(person, house, equality(person.attr("house_id"), house.attr("house_id")))
	    }).apply()
      
      assert.equal({
        name:"person__house",
        attributes:["id", "house_id", "name", "age", 
                    "house_id", "address", "city_id"],
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
      
      person.insertSync([
        [1, 999, "Jane", 5],
        [2, 999, "Puck", 12],
        [3, 999, "Fanny", 30]
      ])
      
      house.insertSync([
        [101, "Chimney Hill", 1001],
        [102, "Parnassus", 1002]
      ])
      
			expression = knit(function(){
	      return select(join(person, house), equality(house.attr("address"), "Chimney Hill"))
	    })
      
			expected = {
        name:"person__house",
        attributes:["id", "house_id", "name", "age", 
                    "house_id", "address", "city_id"],
        tuples:[
          [1, 999, "Jane", 5, 101, "Chimney Hill", 1001],
          [2, 999, "Puck", 12, 101, "Chimney Hill", 1001],
          [3, 999, "Fanny", 30, 101, "Chimney Hill", 1001]
        ]
      }

      assert.equal(expected, relationContents(expression.apply()))
      assert.equal(expected, relationContents(expression.push().apply()))

			assert.equal(true, expression.apply().cost > expression.push().apply().cost)
    })

    test("pushing in a select and making it into a join predicate is less costly than just leaving the select outside", function (){
      
      person.insertSync([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30]
      ])
      
      house.insertSync([
        [101, "Chimney Hill", 1001],
        [102, "Parnassus", 1002]
      ])
      
			expression = knit(function(){
	      return select(join(person, house), equality(house.attr("house_id"), person.attr("house_id")))
	    })
      
			expected = {
        name:"person__house",
        attributes:["id", "house_id", "name", "age", 
                    "house_id", "address", "city_id"],
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
      person.insertSync([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30]
      ])
      
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

