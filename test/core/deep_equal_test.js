require("../test_helper.js")
require("knit/namespace")
require("knit/core/util")
require("../test_relation.js")

regarding("traverse down and compare equality", function() {
  var _ = knit._util
  var deepEqualWithIsEqual = function(a,b){return _.deepEqual(a,b,"isEqual")}
  
  beforeEach(function(){
    this.butterfly = {
      type:"monarch",
      id:123,
      equalCalled:false,
      isEqual:function(other) {
        this.equalCalled = true
        return other.type && other.id &&
               this.type == other.type && this.id == other.id 
      } 
    }    
    
    this.butterflyAgain = _.extend({}, this.butterfly)
    
    this.dog = {
      breed:"terrier",
      id:456,
      equalCalled:false,
      isEqual:function(other) {
        return other.breed && other.id &&
               this.breed == other.breed && this.id == other.id 
      } 
    }
  })
  
  test("primitives", function(){
    assert.equal(true, deepEqualWithIsEqual(1,1))
    assert.equal(true, deepEqualWithIsEqual("foo","foo"))
    assert.equal(true, deepEqualWithIsEqual(null,null))
    assert.equal(true, deepEqualWithIsEqual(undefined,undefined))
    assert.equal(true, deepEqualWithIsEqual(0,0))
    assert.equal(true, deepEqualWithIsEqual(false,false))
    
    assert.equal(false, deepEqualWithIsEqual(2,1))
    assert.equal(false, deepEqualWithIsEqual("ZZZ","foo"))
    assert.equal(false, deepEqualWithIsEqual(1,null))
    assert.equal(false, deepEqualWithIsEqual(1,undefined))
    assert.equal(false, deepEqualWithIsEqual(null,undefined))
  })
  
  regarding("basic - objects that have the equal method defined", function() {
  
    test("simple equals with objects defining isEqual", function(){
      assert.equal(true, deepEqualWithIsEqual(this.butterfly, this.butterflyAgain))
      assert.equal(true, deepEqualWithIsEqual(this.dog, this.dog))
      assert.equal(false, deepEqualWithIsEqual(this.dog, this.butterfly))
    })
  
    test("don't call equal method if triple-equals (identical instance) is true", function(){
      assert.equal(true, deepEqualWithIsEqual(this.butterfly, this.butterfly))
      assert.equal(false, this.butterfly.equalCalled)
      
      assert.equal(true, deepEqualWithIsEqual(this.butterfly, this.butterflyAgain))
      assert.equal(true, this.butterfly.equalCalled)
    })
  
    test("compare against things that don't have an equality method", function(){
      assert.equal(false, deepEqualWithIsEqual(1, this.butterfly))
      assert.equal(false, deepEqualWithIsEqual("foo", this.butterfly))
      assert.equal(false, deepEqualWithIsEqual(null, this.butterfly))
      assert.equal(false, deepEqualWithIsEqual(undefined, this.butterfly))
      assert.equal(false, deepEqualWithIsEqual(this.butterfly, undefined))
    })
  
  })
  
  regarding("in an array", function() {
  
    test("simple", function(){
      assert.equal(true, deepEqualWithIsEqual([this.butterfly], [this.butterflyAgain]))
      assert.equal(false, deepEqualWithIsEqual([this.dog], [this.butterfly]))
    })

    test("with primitives", function(){
      assert.equal(true, deepEqualWithIsEqual([1, this.butterfly], [1, this.butterflyAgain]))
      assert.equal(false, deepEqualWithIsEqual([999, this.butterfly], [1, this.butterflyAgain]))
    })
    
    test("vs nonarray", function(){
      assert.equal(false, deepEqualWithIsEqual([this.butterfly], this.butterflyAgain))
      assert.equal(false, deepEqualWithIsEqual([this.butterfly], undefined))
    })
    
    test("number of elements is different", function(){
      assert.equal(true, deepEqualWithIsEqual([this.butterfly], [this.butterflyAgain]))
      assert.equal(false, deepEqualWithIsEqual([this.butterfly], [this.butterflyAgain, this.butterflyAgain]))
    })

    test("nested", function(){
      assert.equal(true, deepEqualWithIsEqual([[this.butterfly]], [[this.butterflyAgain]]))
      assert.equal(false, deepEqualWithIsEqual([[this.dog]], [[this.butterfly]]))
      assert.equal(false, deepEqualWithIsEqual([[this.butterfly],[[this.dog]]], [[this.butterfly],[[this.butterfly]]]))
      assert.equal(false, deepEqualWithIsEqual([[this.butterfly],[[1,this.dog]]], [[this.butterfly],[[999,this.dog]]]))
    })
    
  })
  
  regarding("in an object", function() {

    test("keys and values must be equal", function(){
      assert.equal(true, deepEqualWithIsEqual({a:this.butterfly}, {a:this.butterfly}))
      assert.equal(true, deepEqualWithIsEqual({a:this.butterfly}, {a:this.butterflyAgain}))
      
      assert.equal(false, deepEqualWithIsEqual({ZZZ:this.butterfly}, {a:this.butterfly}))
      assert.equal(false, deepEqualWithIsEqual({a:this.butterfly}, {a:this.butterfly, b:this.butterfly}))
    })

    test("nested", function(){
      assert.equal(true, deepEqualWithIsEqual({a:{X:this.butterfly}}, {a:{X:this.butterfly}}))
      assert.equal(true, deepEqualWithIsEqual({a:{X:[this.butterfly]}}, {a:{X:[this.butterfly]}}))

      assert.equal(false, deepEqualWithIsEqual({a:{ZZZ:[this.butterfly]}}, {a:{X:[this.butterfly]}}))
      assert.equal(false, deepEqualWithIsEqual({a:{X:[this.dog]}}, {a:{X:[this.butterfly]}}))
    })

  })
    
})

