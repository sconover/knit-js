knit.engine.Memory.Attribute = function(name, sourceRelation) {
  this.name = name
  this._sourceRelation = sourceRelation
}

_.extend(knit.engine.Memory.Attribute.prototype, {
  isSame: function(other) {
    return this.name == other.name &&
           other._nestedRelation === undefined &&
           this._sourceRelation === other._sourceRelation
  },
  
  inspect: function() {
    return this.name
  }

})

knit.engine.Memory.NestedAttribute = function(name, nestedRelation, sourceRelation) {
  this.name = name
  this._nestedRelation = nestedRelation
  this._sourceRelation = sourceRelation
}

_.extend(knit.engine.Memory.NestedAttribute.prototype, {
  isSame: function(other) {
    return this.name == other.name &&
           other._nestedRelation != undefined &&
           this._nestedRelation.isSame(other._nestedRelation) &&
           this._sourceRelation === other._sourceRelation
  },
  
  inspect: function() {
    return this.name + ":" + this._nestedRelation.inspect()
  }

})
