require("../test_helper.js")
require("knit/algebra/project")
require("./test_relation.js")

regarding("order", function() {
    
  beforeEach(function() {
    person = knit(function(){return testRelation(["id", "houseId", "name", "age"])})
    foo = knit(function(){return testRelation(["id", "zzz"])})
  })

  test("inspect", function(){knit(function(){
    assert.equal("project(r[id,houseId,name,age],[name,age])", 
                 project(person, [person.attr("name"), person.attr("age")]).inspect())
  })})

  
  regarding("sameness and equivalence", function() {
    
    test("same if the relation and project attributes are equal", function(){knit(function(){
      assert.same(project(person, [person.attr("name"), person.attr("age")]), project(person, [person.attr("name"), person.attr("age")]))
      assert.notSame(project(person, [person.attr("name"), person.attr("age")]), project(person, [person.attr("name")]))
      assert.notSame(project(person, [person.attr("id")]), project(foo, [foo.attr("id")]))
    })})
        
    test("equivalent is like same", function(){knit(function(){
      assert.equivalent(project(person, [person.attr("name"), person.attr("age")]), project(person, [person.attr("name"), person.attr("age")]))
      assert.notEquivalent(project(person, [person.attr("name"), person.attr("age")]), project(person, [person.attr("name")]))
      assert.notEquivalent(project(person, [person.attr("id")]), project(foo, [foo.attr("id")]))
    })})
        
  })
  
})

