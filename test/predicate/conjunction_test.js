require("../test_helper.js")
require("knit/predicate/conjunction")

regarding("knit.Conjunction", function () {
      
  test("split a conjunction into two parts", function (){
    var p = knit.predicate
    var conjunction = new p.Conjunction(p.TRUE, p.FALSE)
    var predicates = conjunction.split()
    assert.equal([p.TRUE, p.FALSE], predicates)
  })

})

