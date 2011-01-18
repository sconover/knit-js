require("knit/engine/sql/column")

knit.engine.sql.Table = function(name, db) {
  this._name = name
  this._db = db
}

_.extend(knit.engine.sql.Table.prototype, {
  name: function(){ return this._name },
  
  columns: function(){
    return _.map(db.tableDefinition(this.name()).columns, function(column) {
      return new knit.engine.sql.Column(column[0])
    })
  },
  
  col: function(columnName) {
    return _.detect(this.columns(), function(column){return column.name == columnName})
  },
  
  isSame: function(other) {
    return this.name() == other.name()
  },
  
  inspect: function() {
    return this.name() + "[" + 
           _.map(this.attributes(), function(attr){return attr.inspect()}).join(",") + 
           "]" 
  },
  // 
  // all: function() {
  //   return [].concat(this._tuples)
  // },

  // merge: function(tuplesToAdd) {
  //   var self = this
  //   _.each(tuplesToAdd, function(tuple){self._tuples.push(tuple)})
  //   return this
  // }
  
})

knit.engine.sql.Table.prototype.attributes = knit.engine.sql.Table.prototype.columns
knit.engine.sql.Table.prototype.attr = knit.engine.sql.Table.prototype.col
knit.engine.sql.Table.prototype.isEquivalent = knit.engine.sql.Table.prototype.isSame