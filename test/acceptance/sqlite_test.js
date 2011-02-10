require("./helper")
require("knit/engine/sqlite")
require("acceptance/feature/basics")

regarding("Sqlite Engine", function() {
    
  beforeEach(function() {
    this.db = new knit.engine.sqlite.Database(":memory:")
    this.db.open()
    knit._util.bind(setupAcceptanceFixtures, this)(knit._util.bind(this.db.createTable,this.db))
  })
  
  afterEach(function(){ this.db.close() })

  feature.basics()
})