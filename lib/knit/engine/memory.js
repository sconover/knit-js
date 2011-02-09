require("knit/algebra")

knit.engine.memory = {}

knit.engine.memory.createRelation = function(name, attributeNames, primaryKey) {
  return new knit.engine.memory.MutableRelation(name, attributeNames, primaryKey)
}


require("knit/engine/memory/attribute")
require("knit/engine/memory/relation")
require("knit/engine/memory/predicate")
require("knit/engine/memory/standard_row_store")








