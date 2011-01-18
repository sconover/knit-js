require("knit/algebra")
require("knit/apply")

knit.engine.Memory = function() {
}

_.extend(knit.engine.Memory.prototype, {
  createRelation: function(name, attributeNames, primaryKey) {
    return new knit.engine.Memory.MutableRelation(name, attributeNames, primaryKey)
  }
})

require("knit/engine/memory/attribute")
require("knit/engine/memory/relation")
require("knit/engine/memory/predicate")
require("knit/engine/memory/standard_tuple_store")








