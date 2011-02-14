//Column quacksLike Attribute
knit.engine.sqlite.Column = function(){
  var F = function(columnInfo, table) {
            this._columnInfo = columnInfo
            this._table = table
          },
      p = F.prototype
  
  p.name = function(){ return this._columnInfo.name }
  p.type = function(){ return knit.engine.sqlite.SQLITE_COLUMN_TYPE_TO_ATTRIBUTE_TYPE[this._columnInfo.type] }
  p.sourceRelation = function(){ return this._table }
  p.isSame = 
    p.isEquivalent = function(other){ 
      return other.constructor == F &&
             this._columnInfo.name == other._columnInfo.name &&
             this._table.name() == other._table.name()
    }

  return F
}()