knit.engine.sqlite.Table = function() {
  
  var _A = CollectionFunctions.Array.functions,
      _ = knit._util
  
  var F = function(name, columnInformation, db) {
    this._name = name
    var self = this
    this._columns = new knit.Attributes(_A.map(columnInformation, function(columnInfo){
      return new knit.engine.sqlite.Column(columnInfo, self)
    }))
    this._db = db
  }; var p = F.prototype
  
  p.name = function(){ return this._name }
  p.columns = p.attributes = function(){ return this._columns }
  p.attr = function() { return this.attributes().get(_A.toArray(arguments)) }
  p.split = p.perform = function(){return this}
  p.newNestedAttribute = function(){ throw("nested attributes not supported") }
  
  p.isSame = p.isEquivalent = function(other){
    return other.constructor == F &&
           this._name == other._name &&
           this._columns.isSame(other._columns)
  }
  
  p.objects = function() {
    return this._db.query({sql:"select * from " + this._name})
  }
  
  p.rows = function() {
    var objects = this.objects()
    var self = this
    return _A.map(objects, function(object){
      return self.columns().map(function(column) {
        return object[column.name()]
      })      
    })
  }
    
  p.merge = function(rows) {
    var self = this
    var sql = "insert or replace into " + this._name + 
              " values(" + _A.repeat(["?"], this.columns().size()).join(",") + ")"
    _A.each(rows, function(row){
      self._db.execute({sql:sql, values:row})
    })
    return this
  }
    
  F.load = function(db, name) {
    var columnInformation = db.columnInformation(name)
    return new F(name, columnInformation, db)
  }
  return F
}()
