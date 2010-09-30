require("./test_helper.js");
require("arel/mutable_relation");

regarding("arel.MutableRelation", function () {
  
  regarding("tuples", function () {
    test("tuples are available only in specialized relations", function (){
      assert.throws(function(){new arel.MutableRelation("foo").tuples()}, 
                    Error, 
                    "tuples are available only in specialized relations");
    });
  });
});

