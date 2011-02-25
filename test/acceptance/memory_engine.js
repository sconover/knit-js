require("knit/engine/memory")

function createMutableBaseRelation(name, attributeNamesAndTypes, primaryKey) {
  return new knit.engine.memory.MutableBaseRelation(name, attributeNamesAndTypes, primaryKey)
}

engine = typeof engine == "undefined" ? {} : engine
engine.memory = {
  name:"memory",
  setup: function(target) {
    knit._util.bind(setupAcceptanceFixtures, target)(createMutableBaseRelation)
  }
}
