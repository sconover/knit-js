require("../helper")
require("knit/engine/memory")
require("../relation_proof")

xregarding("memory", function() {
  beforeEach(function(){
    var r = this.createRelation("foo", ["a", "b"])
    this.r = r
    this.$R = knit.createBuilderFunction({bindings:{
      r:r
    }})
  })
  
  // relationProof("SqliteRelation", function(attributeNamesAndTypes){ return new knit.engine.Sqlite().this.createRelation("x", attributeNamesAndTypes) } )
  
  xregarding("MemoryRelation inspect", function() {
    test("inspect", function(){
      assert.equal("foo[a,b]", this.r.inspect())
    })
  })

  xregarding(".rows / .objects", function() {
    test("they cause the relation to be applied", function(){this.$R(function(){
      resolve()
      
      relation("r").merge([
        [1, 98],
        [2, 98],
        [3, 99]
      ])
      
      assert.equal([
        [1, 98],
        [2, 98]
      ], select(relation("r"), equality(attr("r.b"), 98)).rows())
    })
  })})
  
  
  xregarding("the 'cost' of a perform using the memory engine is the sum of all the rows of all relations created", function() {

    test("just performing a relation and doing nothing else is zero cost", function(){this.$R(function(){
      resolve()
      assert.equal(0, relation("r").perform().cost)
    })})
    
    test("the size of the select result is the cost", function(){this.$R(function(){
      resolve()
      relation("r").merge([
        [1, 98],
        [2, 98],
        [3, 99]
      ])
      
      assert.equal(1, select(relation("r"), equality(attr("r.a"), 1)).perform().cost)
      assert.equal(2, select(relation("r"), equality(attr("r.b"), 98)).perform().cost)
      assert.equal(3, select(relation("r"), TRUE).perform().cost)
      assert.equal(6, select(select(relation("r"), TRUE), TRUE).perform().cost)
    })})
    
    test("join cost usually depends greatly on whether a good join predicate is available", function(){this.$R(function(){
      var person = this.createRelation("person", ["id", "houseId", "name", "age"])
      var house = this.createRelation("house", ["houseId", "address", "cityId"])
      var city = this.createRelation("city", ["cityId", "name"])
      
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
      
      assert.equal(6, join(person, house).perform().cost)
      assert.equal(6 + 12, join(join(person, house), city).perform().cost)
      
      assert.equal(3, join(person, house, equality(person.attr("houseId"), house.attr("houseId"))).perform().cost)
      assert.equal(3 + 3, join(join(person, house, equality(person.attr("houseId"), house.attr("houseId"))),
                               city, equality(house.attr("cityId"), city.attr("cityId"))).perform().cost)
    }, this)})
    
    test("the numbers of rows involved in an order is the cost", function(){this.$R(function(){
      resolve()
      
      relation("r").merge([
        [1, 98],
        [2, 98],
        [3, 99]
      ])
      
      assert.equal(3, order.asc(relation("r"), attr("r.a")).perform().cost)
      assert.equal(3, order.desc(relation("r"), attr("r.a")).perform().cost)

      assert.equal(6, order.asc(order.asc(relation("r"), attr("r.a")), attr("r.b")).perform().cost)
    })})
  })
})
