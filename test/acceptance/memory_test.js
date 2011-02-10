require("./helper")
require("knit/engine/memory")
require("acceptance/feature/basics")
require("acceptance/feature/order")

regarding("In Memory Engine", function() {
    
  beforeEach(function() { knit._util.bind(setupAcceptanceFixtures, this)(knit.engine.memory.createRelation) })
  
  feature.basics()
  feature.order()
})