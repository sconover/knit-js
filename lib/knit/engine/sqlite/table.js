knit.engine.sqlite.Table = function() {
  
  var _A = CollectionFunctions.Array.functions,
      _ = knit._util
  
  var F = function(name, columnInformation, db) {
    this._name = name
    var self = this
    this._attributes = new knit.Attributes(_A.map(columnInformation, function(columnInfo){
      return new knit.engine.sqlite.Column(columnInfo, self)
    }))
    this._db = db
  }; var p = F.prototype
  
  p.name = function(){ return this._name }
  p.attributes = function(){ return this._attributes }
  p.attr = function() { return this.attributes().get(_A.toArray(arguments)) }
  p.split = p.merge = p.perform = function(){return this}
  
  p.isSame = p.isEquivalent = function(other){
    return other.constructor == F &&
           this._name == other._name &&
           this._attributes.isSame(other._attributes)
  }
  
    
  F.load = function(db, name) {
    var columnInformation = db.columnInformation(name)
    return new F(name, columnInformation, db)
  }
  return F
}()
