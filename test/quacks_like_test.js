require("./test_helper.js")
require("knit/quacks_like")
require("./algebra/test_relation.js")

regarding("slightly-more-formal duck typing support. " +
          "see http://fitzgeraldnick.com/weblog/39/", function() {
  
  beforeEach(function(){
    this.dragonFlySignature = {
      fly: Function,
      wings: Number
    }
    
    this.birdSignature = {
      fly: Function,
      wings: Boolean,
      beak: Object
    }
    
    this.duckSignature = {
      fly: Function,
      wings: Boolean,
      beak: Object,
      webbedFeet: Boolean
    }
    
    this.duck = {fly:function(){/*flap flap*/}, wings:true, beak:{color:"orange"}, webbedFeet:true}
    this.bird = {fly:function(){/*flap flap*/}, wings:true, beak:{color:"yellow"}}
    this.dragonFly = {fly:function(){/*flap flap*/}, wings:4}
  })
  
  regarding("duck typing scenarios", function() {

    test("exact match for signature", function(){
      assert.quacksLike(this.duck, this.duckSignature)
      assert.quacksLike(this.bird, this.birdSignature)
      assert.quacksLike(this.dragonFly, this.dragonFlySignature)
    })
    
    test("if an object has the required signature, it is like that thing, even if it has more stuff besides", function(){
      assert.quacksLike(this.duck, this.birdSignature)
      assert.doesntQuackLike(this.bird, this.duckSignature)
    })
    
    test("types matter", function(){
      assert.doesntQuackLike(this.bird, this.dragonFlySignature)
    })
    
  })
    
})

