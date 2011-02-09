require("../../test_helper")
require("knit/core")
require("knit/engine/sqlite/column")

regarding("column", function() {

  var _A = CollectionFunctions.Array.functions,
      type = knit.attributeType,
      sqlite = knit.engine.sqlite
  
  test("sameness and equivalence", function(){
    assert.same(new sqlite.Column({name:"color", type:"string"}, "fooTable"), 
                new sqlite.Column({name:"color", type:"string"}, "fooTable"))

    assert.notSame(new sqlite.Column({name:"color", type:"string"}, "fooTable"), 
                   new sqlite.Column({name:"color", type:"int"}, "fooTable"))
    assert.notSame(new sqlite.Column({name:"color", type:"string"}, "fooTable"), 
                   new sqlite.Column({name:"name", type:"string"}, "fooTable"))
    assert.notSame(new sqlite.Column({name:"color", type:"string"}, "fooTable"), 
                   new sqlite.Column({name:"color", type:"string"}, "barTable"))

    assert.equivalent(new sqlite.Column({name:"color", type:"string"}, "fooTable"), 
                      new sqlite.Column({name:"color", type:"string"}, "fooTable"))

    assert.notEquivalent(new sqlite.Column({name:"color", type:"string"}, "fooTable"), 
                         new sqlite.Column({name:"color", type:"int"}, "fooTable"))
    assert.notEquivalent(new sqlite.Column({name:"color", type:"string"}, "fooTable"), 
                         new sqlite.Column({name:"name", type:"string"}, "fooTable"))
    assert.notEquivalent(new sqlite.Column({name:"color", type:"string"}, "fooTable"), 
                         new sqlite.Column({name:"color", type:"string"}, "barTable"))
  })    
  
})

