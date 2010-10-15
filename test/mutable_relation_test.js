require("./test_helper.js")
require("knit/relation")

regarding("knit.MutableRelation", function () {
  
  regarding("tuples", function () {
    test("tuples are available only in specialized relations", function (){
      assert.throws(function(){new knit.MutableRelation("foo").tuples()}, 
                    Error, 
                    "tuples are available only in specialized relations")
    })
  })
})

