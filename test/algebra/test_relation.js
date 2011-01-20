require("knit/core")

knit.TestRelationFunction = function(attributeNames) {
  var self = this
  this._attributes = _.map(attributeNames, function(attr){
    if (attr.name) {
      return attr
    } else if (typeof attr == "string") {
      var attributeName = attr
      return new knit.TestAttribute(attributeName, self)
    } else {
      var attributeName = _.keys(attr)[0]
      var nestedRelation = _.values(attr)[0]
      return new knit.TestNestedAttribute(attributeName, nestedRelation, self)
    }
  })
    
}

_.extend(knit.TestRelationFunction.prototype, {
  attributes: function(){ return this._attributes },
  
  attr: function(attributeName) {
    return _.detect(this.attributes(), function(attr){return attr.name == attributeName})
  },
  
  isSame: function(other) {
    return other instanceof knit.TestRelationFunction &&
           this.attributes().length == other.attributes().length &&
           _.detect(this.attributes(), function(attr, i){return !attr.isSame(other.attributes()[i])}) == null
  },
  
  split: function(){return this},
  merge: function(){return this},
  
  newNestedAttribute: function(attributeName, attributesToNest) {
    var nestedRelation = new knit.TestRelationFunction([]) 
    nestedRelation._attributes = attributesToNest
    return new knit.TestNestedAttribute(attributeName, nestedRelation, this)
  },
  
  inspect: function() {
    return "r[" + _.map(this.attributes(), function(attr){return attr.inspect()}).join(",") + "]" 
  }

})

knit.TestRelationFunction.prototype.isEquivalent = knit.TestRelationFunction.prototype.isSame

knit.dslLocals.testRelation = function(attrDefs) {
  return new knit.TestRelationFunction(attrDefs)
}



knit.TestAttribute = function(name, sourceRelation) {
  this.name = name
  this._sourceRelation = sourceRelation
}

_.extend(knit.TestAttribute.prototype, {
  isSame: function(other) {
    return this.name == other.name &&
           other.nestedRelation === undefined &&
           this._sourceRelation === other._sourceRelation
  },
  
  inspect: function() {
    return this.name
  }

})

knit.TestNestedAttribute = function(name, nestedRelation, sourceRelation) {
  this.name = name
  this.nestedRelation = nestedRelation
  this._sourceRelation = sourceRelation
}

_.extend(knit.TestNestedAttribute.prototype, {
  isSame: function(other) {
    return this.name == other.name &&
           other.nestedRelation != undefined &&
           this.nestedRelation.isSame(other.nestedRelation) &&
           this._sourceRelation === other._sourceRelation
  },
  
  inspect: function() {
    return this.name + ":" + this.nestedRelation.inspect()
  }

})
