require("knit/engine/sqlite")
var _ = require("knit/core/util")

function createTable(name, attributeNamesAndTypes, primaryKey) {
  return knit.engine.sqlite.Table.create(this, name, attributeNamesAndTypes, primaryKey)
}

engine = typeof engine == "undefined" ? {} : engine
engine.sqlite = {
  name:"sqlite",
  setup: function(target) {
    target.conn = new knit.engine.sqlite.Connection(":memory:")
    target.conn.open()
    _.bind(setupAcceptanceFixtures, target)(_.bind(createTable,target.conn))
  },
  tearDown: function(target) {
    target.conn.close()
  }
}
