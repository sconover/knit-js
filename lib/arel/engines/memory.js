require("arel/core")

arel.Engines = arel.Engines || {}

arel.Engines.Memory = function(){}

arel.Engines.Memory.RelationFactoryMethods = {
  join: function(otherRelation) {
    return new arel.Engines.Memory.CartesianJoin(this, otherRelation)
  },

  project: function(attributesToKeep) {
    return new arel.Engines.Memory.Projection(this, attributesToKeep)
  }
}

arel.Engines.Memory.AttributeFactoryMethods = {
  eq: function(other) {
    return new arel.Engines.Memory.Predicate.Equals(this, other)
  }
}



require("arel/engines/memory/relation")
require("arel/engines/memory/join")
require("arel/engines/memory/projection")

