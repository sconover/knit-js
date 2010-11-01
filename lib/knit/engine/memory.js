require("knit/algebra")
require("knit/apply")

knit.engine.Memory = function() {
}

_.extend(knit.engine.Memory.prototype, {
  createRelation: function(name, attributeNames) {
    return new knit.engine.Memory.MutableRelation(name, attributeNames)
  }
})

require("knit/engine/memory/attribute")
require("knit/engine/memory/relation")
require("knit/engine/memory/predicate")








