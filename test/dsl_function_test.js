require("./test_helper.js")
require("knit/dsl_function")

regarding("a dsl function presents a set of objects to a user-defined function as locals", function () {

  test("set what you want available in the user-defined function on 'locals'", function (){
    var dsl = new DSLFunction()
    dsl.locals.x = 123
    dsl.locals.hello = function(){return "world"}
    
    dsl(function(){
      assert.equal(123, x)
      assert.equal("world", hello())
    })
  })
    
  test("returns the return value of the user function to the caller", function (){
    var dsl = new DSLFunction()
    
    var returnValue = dsl(function(){
      return "foo"
    })
    
    assert.equal("foo", returnValue)
  })
    
  test("it's fine to do nothing / return nothing", function (){
    var dsl = new DSLFunction()
    
    var returnValue = dsl(function(){
      //nothing
    })
    
    assert.equal(undefined, returnValue)
  })
    
})

