require("knit/core")

knit.engine.sql.Column = function(name, tableName) {
  this.name = name
  this._tableName = tableName
}

_.extend(knit.engine.sql.Column.prototype, {
  isSame: function(other) {
    return this.name == other.name &&
           this._tableName === other._tableName
  },
  
  inspect: function() {
    return this.name
  }

})

knit.engine.sql.Column.prototype.isEquivalent = knit.engine.sql.Column.prototype.isSame
