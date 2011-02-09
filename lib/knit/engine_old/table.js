require("knit/engine/sqlite/column")

knit.engine.sql.Table = function() {
  var _A = CollectionFunctions.Array.functions

  var F = function(name, db) {
    this._name = name
    this._db = db
  }; var p = F.prototype

  p.name = function(){ return this._name }
  
  p.columns = p.attributes = function(){
    return _A.map(db.tableDefinition(this.name()).columns, function(column) {
      return new knit.engine.sql.Column(column[0])
    })
  }
  
  p.col = p.attr = function(columnName) {
    return _A.detect(this.columns(), function(column){return column.name == columnName})
  }
  
  p.isSame = p.isEquivalent = function(other) {
    return this.name() == other.name()
  }
  
  p.inspect = function() {
    return this.name() + "[" + 
           _A.map(this.columns(), function(attr){return attr.inspect()}).join(",") + 
           "]" 
  }
  // 
  // rows: function() {
  //   return [].concat(this._tuples)
  // },

  // merge: function(tuplesToAdd) {
  //   var self = this
  //   _.each(tuplesToAdd, function(tuple){self._tuples.push(tuple)})
  //   return this
  // }
  return F
}()

