//Table quacksLike relation
knit.engine.sqlite.Table = function() {
  var _ = knit._util,
      F = function(name, columnInformation, db) {
            this._name = name
            var self = this
            this._columns = new knit.Attributes(_.map(columnInformation, function(columnInfo){
              return new knit.engine.sqlite.Column(columnInfo, self)
            }))
            this._db = db
          },
      p = F.prototype
  
  p.name = function(){ return this._name }
  p.columns = 
    p.attributes = function(){ return this._columns }
  p.attr = function() { return this.attributes().get(_.toArray(arguments)) }
  p.split = function(){return this}
  
  p.perform = function(){
    return new knit.engine.sqlite.Query(new knit.translation.sql.Select().from(this), this._db)
  }
  
  p.newNestedAttribute = function(){ throw("nested attributes not supported") }
  
  p.isSame = 
    p.isEquivalent = function(other){
      return other.constructor == F &&
             this._name == other._name &&
             this._columns.isSame(other._columns)
    }
  
  p.objects = function() { return this.perform().objects() }
  p.rows = function() { return this.perform().rows() }
    
  p.merge = function(rows) {
    var self = this,
        sql = "insert or replace into " + this._name + 
              " values(" + _.repeat(["?"], this.columns().size()).join(",") + ")"
    _.each(rows, function(row){
      self._db.execute({sql:sql, values:row})
    })
    return this
  }
  
  p.inspect = function() { return this.name() + "[" + this.attributes().inspect() + "]" }
  
  F.load = function(db, name) {
    var columnInformation = db.columnInformation(name)
    return new F(name, columnInformation, db)
  }
  return F
}()
