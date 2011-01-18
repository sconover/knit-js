require("./test_helper.js")
require("knit/dsl_function")

regarding("a dsl function presents a set of objects to a user-defined function as locals", function () {

  test("set what you want available in the user-defined function on 'locals'", function (){
    var dsl = new DSLFunction()
    dsl.dslLocals.x = 123
    dsl.dslLocals.hello = function(){return "world"}
    
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

  test("if a second argument is passed, make it 'this'", function(){
    var dsl = new DSLFunction()
    
    var returnValue = dsl(function(){
      return this.a
    }, {a:4})
    
    assert.equal(4, returnValue)
  })

    
})

regarding("you can specialize a dsl function. " +
          "that is, you can take some existing dsl function and add your own locals", function (){

  test("specialize a dsl function without affecting the original", function(){
    var dslParent = new DSLFunction()
    dslParent.dslLocals.x = 123
    dslParent.dslLocals.hello = function(){return "world"}

    dslParent(function(){
      assert.equal(123, x)
      assert.equal("world", hello())
    })


    
    var dslChild = dslParent.specialize({
      bye: function(){return "bye bye"}
    })
    
    dslParent(function(){
      assert.equal(123, x)
      assert.equal("world", hello())
      assert.equal(true, typeof bye === 'undefined')
    })
    
    dslChild(function(){
      assert.equal(123, x)
      assert.equal("world", hello())
      assert.equal("bye bye", bye())
    })
    
  })

})