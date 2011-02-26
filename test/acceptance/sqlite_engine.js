require("knit/engine/sqlite")

function createTable(name, attributeNamesAndTypes, primaryKey) {
  return knit.engine.sqlite.Table.create(this, name, attributeNamesAndTypes, primaryKey)
}

engine = typeof engine == "undefined" ? {} : engine
engine.sqlite = {
  name:"sqlite",
  setup: function(target) {
    target.conn = new knit.engine.sqlite.Connection(":memory:")
    target.conn.open()
    knit._util.bind(setupAcceptanceFixtures, target)(knit._util.bind(createTable,target.conn))
  },
  tearDown: function(target) {
    target.conn.close()
  }
}
