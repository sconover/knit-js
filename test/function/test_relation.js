require("knit/core")

knit.Attribute = {}
knit.Attribute.IntegerType = "integer"
knit.Attribute.StringType = "string"

knit.TestRelationFunction = function(attrDefs) {
	var self = this
  this.attributes = _.map(attrDefs, function(attrDef){
    return new knit.TestAttribute(attrDef[0], attrDef[1], self)
  })
}

_.extend(knit.TestRelationFunction.prototype, {
  attr: function(attributeName) {
    return _.detect(this.attributes, function(attr){return attr.name == attributeName})
  },
  
  isSame: function(other) {
	  return this === other
  },
  
  split: function(){return this},
  merge: function(){return this},

  
  inspect: function() {
    return "r[" + 
           _.map(this.attributes, function(attr){return attr.inspect()}).join(",") + 
           "]" 
  }

})

knit.TestRelationFunction.prototype.isEquivalent = knit.TestRelationFunction.prototype.isSame

knit.locals.testRelation = function(attrDefs) {
  return new knit.TestRelationFunction(attrDefs)
}



knit.TestAttribute = function(name, type, sourceRelation) {
  this.name = name
  this.type = type
  this._sourceRelation = sourceRelation
}

_.extend(knit.TestAttribute.prototype, {
  isSame: function(other) {
    return this.name == other.name &&
           this._sourceRelation === other._sourceRelation
  },
  
  inspect: function() {
    return this.name
  }

})
