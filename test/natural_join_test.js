require("./test_helper.js")
require("arel/natural_join")

regarding("arel.NaturalJoin", function () {
    
  beforeEach(function() {
    person = new arel.MutableRelation("person")
              .attr("id", arel.Attribute.IntegerType)
              .attr("house_id", arel.Attribute.IntegerType)
              .attr("name", arel.Attribute.StringType)      
              .attr("age", arel.Attribute.IntegerType)      

    house = new arel.MutableRelation("house")
              .attr("house_id", arel.Attribute.IntegerType)
              .attr("address", arel.Attribute.StringType)

    join = new arel.NaturalJoin(person, house)
  })

  
  test("concatenates the relation names together to make a default name", function (){
    assert.equal("person__house", join.name())
  })
    
  test("combines the attributes of the two relations [THIS IS WRONG, REALLY]", function (){
    names = _.map(join.attributes(), function(attr){return attr.name()})
    assert.equal(["id", "house_id", "name", "age", "house_id", "address"], names)
  })

})

