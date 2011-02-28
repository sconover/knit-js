require("knit/engine/memory")
var _ = require("knit/core/util")

function createMutableBaseRelation(name, attributeNamesAndTypes, primaryKey) {
  return new knit.engine.memory.MutableBaseRelation(name, attributeNamesAndTypes, primaryKey)
}

engine = typeof engine == "undefined" ? {} : engine
engine.memory = {
  name:"memory",
  setup: function(target) {
    _.bind(setupAcceptanceFixtures, target)(createMutableBaseRelation)
  }
}
