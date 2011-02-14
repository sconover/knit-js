require("knit/algebra")

knit.engine.memory = {
  createRelation: function(name, attributeNamesAndTypes, primaryKey) {
    return new knit.engine.memory.MutableRelation(name, attributeNamesAndTypes, primaryKey)
  }
}

require("knit/engine/memory/attribute")
require("knit/engine/memory/relation")
require("knit/engine/memory/predicate")
require("knit/engine/memory/standard_row_store")








