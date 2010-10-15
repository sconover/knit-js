require("knit/core")

knit.Engines = knit.Engines || {}

knit.Engines.Memory = function(){}

knit.Engines.Memory.RelationFactoryMethods = {
  join: function(otherRelation) {
    return new knit.Engines.Memory.CartesianJoin(this, otherRelation)
  },

  project: function(attributesToKeep) {
    return new knit.Engines.Memory.Projection(this, attributesToKeep)
  }
}

knit.Engines.Memory.AttributeFactoryMethods = {
  eq: function(other) {
    return new knit.Engines.Memory.Predicate.Equals(this, other)
  }
}



require("knit/engines/memory/relation")
require("knit/engines/memory/join")
require("knit/engines/memory/projection")

