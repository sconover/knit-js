require("./test_helper.js")
require("knit/join")

regarding("knit.Join", function () {
    
  beforeEach(function() {
    person = new knit.MutableRelation("person")
              .attr("id", knit.Attribute.IntegerType)
              .attr("house_id", knit.Attribute.IntegerType)
              .attr("name", knit.Attribute.StringType)      
              .attr("age", knit.Attribute.IntegerType)      

    house = new knit.MutableRelation("house")
              .attr("house_id", knit.Attribute.IntegerType)
              .attr("address", knit.Attribute.StringType)

    join = new knit.Join(person, house)
  })

  
  test("concatenates the relation names together to make a default name", function (){
    assert.equal("person__house", join.name())
  })
    
  test("combines the attributes of the two relations", function (){
    names = _.map(join.attributes(), function(attr){return attr.name()})
    assert.equal(["id", "house_id", "name", "age", "house_id", "address"], names)
  })

})

