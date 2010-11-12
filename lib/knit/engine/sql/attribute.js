require("knit/core")

knit.engine.sql.Attribute = function(name, tableName) {
  this.name = name
  this._tableName = tableName
}

_.extend(knit.engine.sql.Attribute.prototype, {
  isSame: function(other) {
    return this.name == other.name &&
           this._tableName === other._tableName
  },
  
  inspect: function() {
    return this.name
  }

})

knit.engine.sql.Attribute.prototype.isEquivalent = knit.engine.sql.Attribute.prototype.isSame
