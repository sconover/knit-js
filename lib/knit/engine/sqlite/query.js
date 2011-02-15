//Query quacksLike relation
knit.engine.sqlite.Query = function() {
  var _ = knit._util,
      F = function(sql, db) {
            this._sqlSelectObject = sql
            this._db = db
          },
      p = F.prototype
  
  _.each(["attributes", "columns", "attr", "inspect", 
          "merge", "split", "newNestedAttribute", "isEquivalent", "isSame",
          "from", "what", "where", "order"], function(methodNameToDelegate) {
    p[methodNameToDelegate] = function() { 
      return this._sqlSelectObject[methodNameToDelegate].apply(this._sqlSelectObject, arguments) 
    }
  })

  p.name = function(){
    //bad
    return _.map(this._sqlSelectObject._froms, function(table){return table.name()}).join("__")
  }
  
  p.objects = function() {
    return this._db.query(this._sqlSelectObject.toStatement())
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
  
  F.expressionCompiler = function(db) {
    return function(expression) {
      return new F(expression.toSql(), db)
    }
  }
  
  return F
}()
