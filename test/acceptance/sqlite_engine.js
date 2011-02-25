require("knit/engine/sqlite")

function createTable(name, attributeNamesAndTypes, primaryKey) {
  return knit.engine.sqlite.Table.create(this, name, attributeNamesAndTypes, primaryKey)
}

engine = typeof engine == "undefined" ? {} : engine
engine.sqlite = {
  name:"sqlite",
  setup: function(target) {
    target.db = new knit.engine.sqlite.Database(":memory:")
    target.db.open()
    knit._util.bind(setupAcceptanceFixtures, target)(knit._util.bind(createTable,target.db))
  },
  tearDown: function(target) {
    target.db.close()
  }
}
