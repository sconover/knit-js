require("knit/core")

knit.engine.sql.Column = function(name, tableName) {
  this._name = name
  this._tableName = tableName
}

_.extend(knit.engine.sql.Column.prototype, {
  name: function() {return this._name},
  
  isSame: function(other) {
    return this.name() == other.name() &&
           this._tableName === other._tableName
  },
  
  inspect: function() {
    return this.name()
  }

})

knit.engine.sql.Column.prototype.isEquivalent = knit.engine.sql.Column.prototype.isSame
