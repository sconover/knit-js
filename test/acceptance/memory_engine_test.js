require("../test_helper.js");
require("arel")
require("arel/engines/memory")

regarding("In Memory Engine", function () {
    
  beforeEach(function() {
    memoryEngine = new arel.Engines.Memory();
    person = memoryEngine.mutableRelation("person")
              .attr("id", arel.Attribute.IntegerType)
              .attr("house_id", arel.Attribute.IntegerType)
              .attr("name", arel.Attribute.StringType)      
              .attr("age", arel.Attribute.IntegerType);      
              
    house = memoryEngine.mutableRelation("house")
              .attr("house_id", arel.Attribute.IntegerType)
              .attr("address", arel.Attribute.StringType);
  });

  regarding("Basics", function () {

    test("insert, read", function (){
      person.insertSync([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12]
      ])
      
      assert.equal([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12]
      ], person.tuplesSync());
      
      person.insertSync([
        [3, 102, "Fanny", 30]
      ])

      assert.equal([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30]
      ], person.tuplesSync());
    });
    
  });

  
  xregarding("Natural Join", function () {

    test("basic natural join.  all rows connect.", function (){
      person.insertSync([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30]
      ])
      
      house.insertSync([
        [101, "Chimney Hill"],
        [102, "Parnassus"]
      ])
      
      resultRelation = person.naturalJoin(house);
      
      assert.equal([
        [1, 101, "Jane", 5, "Chimney Hill"],
        [2, 101, "Puck", 12, "Chimney Hill"],
        [3, 102, "Fanny", 30, "Parnassus"]
      ], resultRelation.tuplesSync());

      // assert.equal(person.
      //                join(house).
      //                  on(person.attr("house_id").eq(house.attr("house_id")))).
      //                end.
      //              tuplesSync(), 
      //              relation.tuplesSync());
    });
    
  });

  
});

