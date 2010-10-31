require("knit/core")

knit.engine.Memory = function() {
}

_.extend(knit.engine.Memory.prototype, {
  createRelation: function(name, attributeNames) {
    return new knit.engine.Memory.MutableRelation(name, attributeNames)
  }
})


knit.engine.Memory.MutableRelation = function(name, attributeNames) {
	this.name = name
	var self = this
	this.attributes = _.map(attributeNames, function(attributeName){return new knit.engine.Memory.Attribute(attributeName, self)})
}

_.extend(knit.engine.Memory.MutableRelation.prototype, {
	attr: function(attributeName) {
    return _.detect(this.attributes, function(attr){return attr.name == attributeName})
  },
	
  isSame: function(other) {
	  return this === other
  },

  inspect: function() {
    return this.name + "[" + 
           _.map(this.attributes, function(attr){return attr.inspect()}).join(",") + 
           "]" 
  }

})

knit.engine.Memory.MutableRelation.prototype.isEquivalent = knit.engine.Memory.MutableRelation.prototype.isSame


knit.engine.Memory.Attribute = function(name, sourceRelation) {
  this.name = name
  this._sourceRelation = sourceRelation
}

_.extend(knit.engine.Memory.Attribute.prototype, {
  isSame: function(other) {
    return this.name == other.name &&
           this._sourceRelation === other._sourceRelation
  },
  
  inspect: function() {
    return this.name
  }

})
