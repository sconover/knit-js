require("../test_helper.js")
require("knit/algebra/join")
require("knit/algebra/select")
require("./test_relation.js")

regarding("select", function() {
    
  beforeEach(function() {
    person = knit(function(){return testRelation(["id", "houseId", "name", "age"])})
    house = knit(function(){return testRelation(["houseId", "address", "cityId"])})
    city = knit(function(){return testRelation(["cityId", "name"])})
  })

  test("inspect", function(){knit(function(){
    assert.equal("select(r[id,houseId,name,age],eq(1,1))", 
                 select(person, TRUE).inspect())
  })})

  
  regarding("sameness and equivalence", function() {
    
    test("same - simple", function(){knit(function(){
      assert.same(select(person, TRUE), select(person, TRUE))
      assert.notSame(select(person, TRUE), select(person, FALSE))
      assert.notSame(select(person, TRUE), select(house, TRUE))
    })})
        
    test("commutativity - order of selects doesn't matter (effectively a conjunction)", function(){knit(function(){
      assert.equivalent(select(select(person, FALSE), TRUE), select(select(person, TRUE), FALSE))
      assert.notEquivalent(select(select(person, FALSE), TRUE), select(select(person, FALSE), FALSE))
      assert.notSame(select(select(person, FALSE), TRUE), select(select(person, TRUE), FALSE))
    })})
    
    test("split selects are equivalent", function(){knit(function(){
      assert.equivalent(select(person, conjunction(TRUE, FALSE)), select(select(person, TRUE), FALSE))
      assert.equivalent(select(person, conjunction(TRUE, FALSE)), select(select(person, FALSE), TRUE))
      assert.notEquivalent(select(person, conjunction(TRUE, FALSE)), select(select(person, TRUE), TRUE))
      assert.notSame(select(person, conjunction(TRUE, FALSE)), select(select(person, TRUE), FALSE))
    })})
    
  })
  
  regarding("merging and splitting", function() {
    
    test("merge a nested selection, becomes a conjunction", function(){knit(function(){      
      assert.same(select(select(person, TRUE), FALSE).merge(), select(person, conjunction(TRUE, FALSE)))
    })})
      
    test("merge a fully merged selection does nothing", function(){knit(function(){
      assert.same(select(person, conjunction(TRUE, FALSE)).merge(), select(person, conjunction(TRUE, FALSE)))
    })})
      
      
    test("split a select having a conjunction, makes separate nested selects", function(){knit(function(){
      assert.same(select(person, conjunction(TRUE, FALSE)).split(), select(select(person, TRUE), FALSE))
    })})

    test("it's splits (and merges) all the way down", function(){knit(function(){
      var nested = select(select(person, conjunction(TRUE, TRUE)), conjunction(FALSE, FALSE))
      
      assert.same(nested.split(),
                  select(
                    select(
                      select(
                        select(person, TRUE), 
                        TRUE
                      ),
                      FALSE
                    ),
                    FALSE
                  )
                  )
                  
      assert.same(nested, nested.split().merge())
    })})

    test("split a fully split selection, does nothing", function(){knit(function(){      
      assert.same(select(select(person, TRUE), FALSE).split(), select(select(person, TRUE), FALSE))
    })})
      
  })
  
  
  regarding("selection pushing - basic", function() {
    
    test("a selection can be pushed inside a join if the select contains only primitives " +
         "and attributes of one of the relations in the join", function(){knit(function(){
      assert.same(select(join(person, house), equality(person.attr("age"), 55)),
                  select(join(person, house), equality(person.attr("age"), 55)))
      
      assert.same(select(join(person, house), equality(person.attr("age"), 55)).push(),
                  join(select(person, equality(person.attr("age"), 55)), house))

      assert.same(select(join(person, house), equality(house.attr("address"), "123 Main")).push(),
                  join(person, select(house, equality(house.attr("address"), "123 Main"))))
    })})
    
    test("selects that have attributes from each join can't be pushed (bounce!)", function(){knit(function(){
      assert.same(select(join(person, house), equality(person.attr("age"), city.attr("name"))).push(),
                  select(join(person, house), equality(person.attr("age"), city.attr("name"))))
    })})
    
    test("can't push into a non-join", function(){knit(function(){
      assert.same(select(person, equality(person.attr("age"), 55)).push(),
                  select(person, equality(person.attr("age"), 55)))
    })})
    
  })  
  
  regarding("selection pushing - deeper join", function() {

    test("keep pushing into nested joins", function(){knit(function(){
      assert.same(select(join(city, join(person, house)), equality(person.attr("age"), 55)).push(),
                  join(city, join(select(person, equality(person.attr("age"), 55)), house)))
      
      assert.same(select(join(join(person, house), city), equality(person.attr("age"), 55)).push(),
                  join(join(select(person, equality(person.attr("age"), 55)), house), city))
    })})

  })

  regarding("selection pushing - deep selects", function() {

    test("push through layers of selects", function(){knit(function(){
      
      assert.same(select(
                    select(
                      join(person, house), 
                      equality(person.attr("name"), "Emily")  
                    ),
                    equality(person.attr("age"), 55) 
                  ).push(),

                  join(
                    select(
                      select(
                        person, 
                        equality(person.attr("age"), 55)
                      ),
                      equality(person.attr("name"), "Emily")
                    ),
                    house
                  ))


      assert.same(select(
                    select(
                      join(person, house), 
                      equality(person.attr("age"), 55)
                    ),
                    equality(house.attr("address"), "123 Main")
                  ).push(),

                  join(
                    select(
                      person, 
                      equality(person.attr("age"), 55)
                    ),
                    select(
                      house, 
                      equality(house.attr("address"), "123 Main")
                    )
                  ))


    })})

  })


  regarding("selection pushing - a selection becomes a join predicate when there's " + 
            "an attribute present from each side of the join", function(){knit(function(){

    test("push into the join, select disappears", function(){knit(function(){
      assert.same(select(join(person, house), equality(person.attr("houseId"), house.attr("houseId"))).push(),
                  join(person, house, equality(person.attr("houseId"), house.attr("houseId"))))
    })})
      
    test("complex select pushes as well", function(){knit(function(){
      assert.same(select(join(person, house), conjunction(equality(person.attr("houseId"), 1), equality(house.attr("houseId"), 2))).push(),
                  join(person, house, conjunction(equality(person.attr("houseId"), 1), equality(house.attr("houseId"), 2))))
    })})

    test("two selects push in and become a conjunction", function(){knit(function(){
      assert.same(select(select(join(person, house), equality(person.attr("houseId"), house.attr("houseId"))), equality(person.attr("age"), house.attr("address"))).push(),
                  join(person, house, conjunction(equality(person.attr("houseId"), house.attr("houseId")), equality(person.attr("age"), house.attr("address")))))
    })})

    test("won't merge if there are attributes from other relations", function(){knit(function(){
      assert.same(select(select(join(person, house), equality(person.attr("houseId"), house.attr("houseId"))), equality(city.attr("name"), house.attr("address"))).push(),
                  select(
                          join(person, house, equality(person.attr("houseId"), house.attr("houseId"))),
                          equality(city.attr("name"), house.attr("address")) 
                        )
                 )
    })})

      
  })})
})

