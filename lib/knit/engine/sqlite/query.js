//Query quacksLike relation
knit.engine.sqlite.Query = function() {
  var _ = knit._util,
      F = function(sql, db) {
            this._sql = sql
            this._db = db
          },
      p = F.prototype
  
  _.each(["attributes", "columns", "attr", "inspect", 
          "merge", "split", "newNestedAttribute", "isEquivalent", "isSame",
          "from", "what", "where", "order"], function(methodNameToDelegate) {
    p[methodNameToDelegate] = function() { 
      return this._sql[methodNameToDelegate].apply(this._sql, arguments) 
    }
  })

  p.perform = function(){return this}  
  
  p.objects = function() {
    return this._db.query(this._sql.toStatement())
  }
  p.rows = function() {
    var objects = this.objects(),
        self = this
    return _.map(objects, function(object){
      return self.columns().map(function(column) {
        return object[column.name()]
      })      
    })
  }
    
  return F
}()
