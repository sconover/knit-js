require("./helper")

require("knit/engine/memory")

xregarding("In Memory Engine", function() {
    
  beforeEach(function() { knit._util.bind(setupAcceptanceFixtures, this)(knit.engine.memory.createRelation) })
  
  with(feature) {
  
    basics()

    select()
    selectionPushing()
    project()
    order()

    join()
    leftOuterJoin()
    rightOuterJoin()
    naturalJoin()
    divide()

    nest()
    unnest()  
    
  }
  
})