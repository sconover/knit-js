require("./helper")

require("knit/engine/sqlite")

regarding("Sqlite Engine", function() {
    
  beforeEach(function() {
    this.db = new knit.engine.sqlite.Database(":memory:")
    this.db.open()
    knit._util.bind(setupAcceptanceFixtures, this)(knit._util.bind(this.db.createTable,this.db))
  })
  
  afterEach(function(){ this.db.close() })

  with(feature) {
  
    basics()

    // select()
    // selectionPushing()
    // project()
    // order()
    // 
    // join()
    // leftOuterJoin()
    // rightOuterJoin()
    // naturalJoin()
    // divide()
    // 
    // nest()
    // unnest()  
    
  }

})