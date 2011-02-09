//Column quacksLike Attribute

knit.engine.sqlite.Column = function(){
  
  var _A = CollectionFunctions.Array.functions,
      _ = knit._util
  
  var F = function(columnInfo, table) {
    this._columnInfo = columnInfo
    this._table = table
  }; var p = F.prototype
  
  p.name = function(){ return this._columnInfo.name }
  p.sourceRelation = function(){return this._table}
  p.isSame = p.isEquivalent = function(other){ 
    return other.constructor == F &&
           this._columnInfo.name == other._columnInfo.name &&
           this._columnInfo.type == other._columnInfo.type &&
           this._table.name() == other._table.name()
  }

  return F
  
}()