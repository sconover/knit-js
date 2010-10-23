require("./test_helper.js")
require("knit/join_function")
require("knit/relation")

regarding("knit.JoinFunction", function () {
    
  beforeEach(function() {
    person = new knit.MutableRelation("person")
              .attr("id", knit.Attribute.IntegerType)
              .attr("house_id", knit.Attribute.IntegerType)
              .attr("name", knit.Attribute.StringType)      
              .attr("age", knit.Attribute.IntegerType)      

    house = new knit.MutableRelation("house")
              .attr("house_id", knit.Attribute.IntegerType)
              .attr("address", knit.Attribute.StringType)

    join = knit(function(){return join(person, house)})
  })

  test("combines the attributes of the two relations", function (){
    names = _.map(join.attributes, function(attr){return attr.name()})
    assert.equal(["id", "house_id", "name", "age", "house_id", "address"], names)
  })

})

