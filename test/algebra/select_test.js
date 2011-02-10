require("../test_helper.js")
require("knit/algebra/join")
require("knit/algebra/select")
require("./../test_relation.js")

regarding("select", function() {
    
  beforeEach(function(){ setupPersonHouseCity(this) })
  
  test("inspect", function(){this.$R(function(){
    assert.equal("select(*person,eq(1,1))", select(relation("person"), TRUE).inspect())
  })})

  
  regarding("sameness and equivalence", function() {
    
    test("same - simple", function(){this.$R(function(){ resolve()
      assert.same(select(relation("person"), TRUE), select(relation("person"), TRUE))
      assert.notSame(select(relation("person"), TRUE), select(relation("person"), FALSE))
      assert.notSame(select(relation("person"), TRUE), select(relation("house"), TRUE))
    })})
        
    test("commutativity - order of selects doesn't matter (effectively a conjunction)", function(){this.$R(function(){ 
      resolve()
      assert.equivalent(select(select(relation("person"), FALSE), TRUE), select(select(relation("person"), TRUE), FALSE))
      assert.notEquivalent(select(select(relation("person"), FALSE), TRUE), select(select(relation("person"), FALSE), FALSE))
      assert.notSame(select(select(relation("person"), FALSE), TRUE), select(select(relation("person"), TRUE), FALSE))
    })})
    
    test("split selects are equivalent", function(){this.$R(function(){ 
      resolve()
      assert.equivalent(select(relation("person"), conjunction(TRUE, FALSE)), select(select(relation("person"), TRUE), FALSE))
      assert.equivalent(select(relation("person"), conjunction(TRUE, FALSE)), select(select(relation("person"), FALSE), TRUE))
      assert.notEquivalent(select(relation("person"), conjunction(TRUE, FALSE)), select(select(relation("person"), TRUE), TRUE))
      assert.notSame(select(relation("person"), conjunction(TRUE, FALSE)), select(select(relation("person"), TRUE), FALSE))
    })})
    
  })
  
  regarding("merging and splitting", function() {
    
    test("merge a nested selection, becomes a conjunction", function(){this.$R(function(){ 
      resolve()
      assert.same(select(select(relation("person"), TRUE), FALSE).merge(), select(relation("person"), conjunction(TRUE, FALSE)))
    })})
      
    test("merge a fully merged selection does nothing", function(){this.$R(function(){ 
      resolve()
      assert.same(select(relation("person"), conjunction(TRUE, FALSE)).merge(), select(relation("person"), conjunction(TRUE, FALSE)))
    })})
      
      
    test("split a select having a conjunction, makes separate nested selects", function(){this.$R(function(){ 
      resolve()
      assert.same(select(relation("person"), conjunction(TRUE, FALSE)).split(), select(select(relation("person"), TRUE), FALSE))
    })})

    test("it's splits (and merges) all the way down", function(){this.$R(function(){ 
      resolve()
      var nested = select(select(relation("person"), conjunction(TRUE, TRUE)), conjunction(FALSE, FALSE))
      
      assert.same(nested.split(),
                  select(
                    select(
                      select(
                        select(relation("person"), TRUE), 
                        TRUE
                      ),
                      FALSE
                    ),
                    FALSE
                  )
                  )
                  
      assert.same(nested, nested.split().merge())
    })})

    test("split a fully split selection, does nothing", function(){this.$R(function(){
      resolve()
      assert.same(select(select(relation("person"), TRUE), FALSE).split(), select(select(relation("person"), TRUE), FALSE))
    })})
      
  })
  
  
  regarding("selection pushing - basic", function() {
    
    test("a selection can be pushed inside a join if the select contains only primitives " +
         "and attributes of one of the relations in the join", function(){this.$R(function(){ 
      resolve()
      assert.same(select(join(relation("person"), relation("house")), equality(attr("person.age"), 55)),
                  select(join(relation("person"), relation("house")), equality(attr("person.age"), 55)))
      
      assert.same(select(join(relation("person"), relation("house")), equality(attr("person.age"), 55)).push(),
                  join(select(relation("person"), equality(attr("person.age"), 55)), relation("house")))

      assert.same(select(join(relation("person"), relation("house")), equality(attr("house.address"), "123 Main")).push(),
                  join(relation("person"), select(relation("house"), equality(attr("house.address"), "123 Main"))))
    })})
    
    test("selects that have attributes from each join can't be pushed (bounce!)", function(){this.$R(function(){ 
      resolve()
      assert.same(select(join(relation("person"), relation("house")), equality(attr("person.age"), attr("city.name"))).push(),
                  select(join(relation("person"), relation("house")), equality(attr("person.age"), attr("city.name"))))
    })})
    
    test("can't push into a non-join", function(){this.$R(function(){ 
      resolve()
      assert.same(select(relation("person"), equality(attr("person.age"), 55)).push(),
                  select(relation("person"), equality(attr("person.age"), 55)))
    })})
    
  })  
  
  regarding("selection pushing - deeper join", function() {

    test("keep pushing into nested joins", function(){this.$R(function(){ 
      resolve()
      assert.same(select(join(relation("city"), join(relation("person"), relation("house"))), equality(attr("person.age"), 55)).push(),
                  join(relation("city"), join(select(relation("person"), equality(attr("person.age"), 55)), relation("house"))))
      
      assert.same(select(join(join(relation("person"), relation("house")), relation("city")), equality(attr("person.age"), 55)).push(),
                  join(join(select(relation("person"), equality(attr("person.age"), 55)), relation("house")), relation("city")))
    })})

  })

  regarding("selection pushing - deep selects", function() {

    test("push through layers of selects", function(){this.$R(function(){ 
      resolve()
      
      assert.same(select(
                    select(
                      join(relation("person"), relation("house")), 
                      equality(attr("person.name"), "Emily")  
                    ),
                    equality(attr("person.age"), 55) 
                  ).push(),

                  join(
                    select(
                      select(
                        relation("person"), 
                        equality(attr("person.age"), 55)
                      ),
                      equality(attr("person.name"), "Emily")
                    ),
                    relation("house")
                  ))


      assert.same(select(
                    select(
                      join(relation("person"), relation("house")), 
                      equality(attr("person.age"), 55)
                    ),
                    equality(attr("house.address"), "123 Main")
                  ).push(),

                  join(
                    select(
                      relation("person"), 
                      equality(attr("person.age"), 55)
                    ),
                    select(
                      relation("house"), 
                      equality(attr("house.address"), "123 Main")
                    )
                  ))


    })})

  })


  regarding("selection pushing - a selection becomes a join predicate when there's " + 
            "an attribute present from each side of the join", function(){

    test("push into the join, select disappears", function(){this.$R(function(){ 
      resolve()
      assert.same(select(join(relation("person"), relation("house")), equality(attr("person.houseId"), attr("house.houseId"))).push(),
                  join(relation("person"), relation("house"), equality(attr("person.houseId"), attr("house.houseId"))))
    })})
      
    test("complex select pushes as well", function(){this.$R(function(){ 
      resolve()
      assert.same(select(join(relation("person"), relation("house")), conjunction(equality(attr("person.houseId"), 1), equality(attr("house.houseId"), 2))).push(),
                  join(relation("person"), relation("house"), conjunction(equality(attr("person.houseId"), 1), equality(attr("house.houseId"), 2))))
    })})

    test("two selects push in and become a conjunction", function(){this.$R(function(){ 
      resolve()
      assert.same(select(select(join(relation("person"), relation("house")), equality(attr("person.houseId"), attr("house.houseId"))), equality(attr("person.age"), attr("house.address"))).push(),
                  join(relation("person"), relation("house"), conjunction(equality(attr("person.houseId"), attr("house.houseId")), equality(attr("person.age"), attr("house.address")))))
    })})

    test("won't merge if there are attributes from other relations", function(){this.$R(function(){ 
      resolve()
      assert.same(select(select(join(relation("person"), relation("house")), equality(attr("person.houseId"), attr("house.houseId"))), equality(attr("city.name"), attr("house.address"))).push(),
                  select(
                          join(relation("person"), relation("house"), equality(attr("person.houseId"), attr("house.houseId"))),
                          equality(attr("city.name"), attr("house.address")) 
                        )
                 )
    })})

      
  })
})

