require("../test_helper.js")
require("knit/function/join")
require("knit/function/select")
require("./test_relation.js")

regarding("select", function() {
    
  beforeEach(function() {
    person = knit(function(){return testRelation([
      ["id", knit.Attribute.IntegerType],
      ["house_id", knit.Attribute.IntegerType],
      ["name", knit.Attribute.StringType],
      ["age", knit.Attribute.IntegerType]
    ])})    
    
    house = knit(function(){return testRelation([
      ["house_id", knit.Attribute.IntegerType],
      ["address", knit.Attribute.StringType],
      ["city_id", knit.Attribute.IntegerType]
    ])})

    city = knit(function(){return testRelation([
      ["city_id", knit.Attribute.IntegerType],
      ["name", knit.Attribute.StringType]
    ])})
  })

  test("inspect", function (){knit(function(){
    assert.equal("select(r[id,house_id,name,age],eq(1,1))", 
                 select(person, TRUE).inspect())
  })})

  
  regarding("sameness and equivalence", function() {
    
    test("same - simple", function (){knit(function(){
      assert.equal(true, select(person, TRUE).isSame(select(person, TRUE)))
      
      assert.equal(false, select(person, TRUE).isSame(select(person, FALSE)))
      assert.equal(false, select(person, TRUE).isSame(select(house, TRUE)))
    })})
        
    test("commutativity - order of selects doesn't matter (effectively a conjunction)", function (){knit(function(){
      assert.equal(true, select(select(person, FALSE), TRUE).
                           isEquivalent(select(select(person, TRUE), FALSE)))
      
      assert.equal(false, select(select(person, FALSE), TRUE).
                            isEquivalent(select(select(person, FALSE), FALSE)))
      
      assert.equal(false, select(select(person, FALSE), TRUE).
                            isSame(select(select(person, TRUE), FALSE)))
    })})
    
    test("split selects are equivalent", function (){knit(function(){
      assert.equal(true, select(person, conjunction(TRUE, FALSE)).
                           isEquivalent(select(select(person, TRUE), FALSE)))
      
      assert.equal(true, select(person, conjunction(TRUE, FALSE)).
                           isEquivalent(select(select(person, FALSE), TRUE)))
      
      assert.equal(false, select(person, conjunction(TRUE, FALSE)).
                            isEquivalent(select(select(person, TRUE), TRUE)))
      
      assert.equal(false, select(person, conjunction(TRUE, FALSE)).
                            isSame(select(select(person, TRUE), FALSE)))
    })})
    
  })
  
  regarding("merging and splitting", function() {
    
    test("merge a nested selection, becomes a conjunction", function(){knit(function(){      
      assert.equal(true, select(select(person, TRUE), FALSE).
                           merge().isSame(select(person, conjunction(TRUE, FALSE))))
    })})
      
    test("merge a fully merged selection does nothing", function(){knit(function(){
      assert.equal(true, select(person, conjunction(TRUE, FALSE)).
                           merge().isSame(select(person, conjunction(TRUE, FALSE))))
    })})
      
      
    test("split a select having a conjunction, makes separate nested selects", function(){knit(function(){
      assert.equal(true, select(person, conjunction(TRUE, FALSE)).
                           split().isSame(select(select(person, TRUE), FALSE)))
    })})

    test("it's splits (and merges) all the way down", function(){knit(function(){
      var nested = select(select(person, conjunction(TRUE, TRUE)), conjunction(FALSE, FALSE))
      
      assert.equal(true, nested.split().isSame(
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
                  )
                  
      assert.equal(true, nested.isSame(nested.split().merge()))
    })})

    test("split a fully split selection, does nothing", function(){knit(function(){      
      assert.equal(true, select(select(person, TRUE), FALSE).
                           split().isSame(select(select(person, TRUE), FALSE)))
    })})
      
  })
  
  
  regarding("selection pushing - basic", function() {
    
    test("a selection can be pushed inside a join if the select contains only primitives " +
         "and attributes of one of the relations in the join", function (){knit(function(){
      assert.equal(true, select(join(person, house), equality(person.attr("age"), 55)).
                            isSame(select(join(person, house), equality(person.attr("age"), 55))))
      
      assert.equal(true, select(join(person, house), equality(person.attr("age"), 55)).push().
                            isSame(join(select(person, equality(person.attr("age"), 55)), house)))

      assert.equal(true, select(join(person, house), equality(house.attr("address"), "123 Main")).push().
                            isSame(join(person, select(house, equality(house.attr("address"), "123 Main")))))
    })})
    
    test("selects that have attributes from each join can't be pushed (bounce!)", function (){knit(function(){
      assert.equal(true, select(join(person, house), equality(person.attr("age"), city.attr("name"))).push().
                            isSame(select(join(person, house), equality(person.attr("age"), city.attr("name")))))
    })})
    
    test("can't push into a non-join", function (){knit(function(){
      assert.equal(true, select(person, equality(person.attr("age"), 55)).push().
                            isSame(select(person, equality(person.attr("age"), 55))))
    })})
    
  })  
  
  regarding("selection pushing - deeper join", function() {

    test("keep pushing into nested joins", function (){knit(function(){
      assert.equal(true, select(join(city, join(person, house)), equality(person.attr("age"), 55)).push().
                            isSame(join(city, join(select(person, equality(person.attr("age"), 55)), house))))
      
      assert.equal(true, select(join(join(person, house), city), equality(person.attr("age"), 55)).push().
                              isSame(join(join(select(person, equality(person.attr("age"), 55)), house), city)))
    })})

  })

  regarding("selection pushing - deep selects", function() {

    test("push through layers of selects", function(){knit(function(){
      
      assert.equal(true, select(
                           select(
                             join(person, house), 
                             equality(person.attr("age"), 55)
                           ), 
                           equality(person.attr("name"), "Emily")
                         ).
                         push().
                  isSame(
                         join(
                           select(
                             select(
                               person, 
                               equality(person.attr("age"), 55)
                             ),
                             equality(person.attr("name"), "Emily")
                           ),
                           house
                         )))


      assert.equal(true, select(
                           select(
                             join(person, house), 
                             equality(person.attr("age"), 55)
                           ),
                           equality(house.attr("address"), "123 Main")
                         ).
                         push().
                  isSame(
                         join(
                           select(
                             person, 
                             equality(person.attr("age"), 55)
                           ),
                           select(
                             house, 
                             equality(house.attr("address"), "123 Main")
                           )
                         )))


    })})

  })


  regarding("selection pushing - a selection becomes a join predicate when there's " + 
            "an attribute present from each side of the join", function(){knit(function(){

    test("push into the join, select disappears", function (){knit(function(){
      assert.equal(true, select(join(person, house), equality(person.attr("house_id"), house.attr("house_id"))).push().
                            isSame(join(person, house, equality(person.attr("house_id"), house.attr("house_id")))))
    })})
    	
    test("complex select pushes as well", function (){knit(function(){
      assert.equal(true, select(join(person, house), conjunction(equality(person.attr("house_id"), 1), equality(house.attr("house_id"), 2))).push().
                            isSame(join(person, house, conjunction(equality(person.attr("house_id"), 1), equality(house.attr("house_id"), 2)))))
    })})

    test("two selects push in and become a conjunction", function (){knit(function(){
      assert.equal(true, select(select(join(person, house), equality(person.attr("house_id"), house.attr("house_id"))), equality(person.attr("age"), house.attr("address"))).push().
                            isSame(join(person, house, conjunction(equality(person.attr("age"), house.attr("address")), equality(person.attr("house_id"), house.attr("house_id"))))))
    })})

    	
	})})
})

