knit.engine.sql.Attribute = function(name, sourceRelation) {
  this.name = name
}

_.extend(knit.engine.sql.Attribute.prototype, {
  // isSame: function(other) {
  //   return this.name == other.name &&
  //          this._sourceRelation === other._sourceRelation
  // },
  // 
  // inspect: function() {
  //   return this.name
  // }

})
