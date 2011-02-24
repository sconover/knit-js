require("knit/algebra")
require("knit/algorithms")

knit.engine.memory = {
  createRelation: function(name, attributeNamesAndTypes, primaryKey) {
    return new knit.engine.memory.MutableBaseRelation(name, attributeNamesAndTypes, primaryKey)
  }
}

require("knit/engine/memory/attribute")
require("knit/engine/memory/base_relation")
require("knit/engine/memory/standard_row_store")








