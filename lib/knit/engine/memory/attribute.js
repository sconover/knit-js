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
