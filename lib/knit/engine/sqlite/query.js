require("knit/executable_relation")
//Query quacksLike relation
knit.engine.sqlite.Query = function() {
  var _ = knit._util,
      F = function(sqlSelectObject, db) {
            this._sqlSelectObject = sqlSelectObject
            this._db = db
          },
      p = F.prototype
  
  p.name = function(){
    //bad
    var tables = 
      _.empty(this._sqlSelectObject._joins) ?
        this._sqlSelectObject._froms :
        _.uniq(_.flatten(_.map(this._sqlSelectObject._joins, function(join){return [join.left, join.right]})))
    return _.map(tables, function(table){return table.name()}).join("__")
  }
  
  _.each(["attributes", "columns", "attr", "inspect", 
          "merge", "split", "newNestedAttribute", "isEquivalent", "isSame"], function(methodNameToDelegate) {
    p[methodNameToDelegate] = function() { 
      return this._sqlSelectObject[methodNameToDelegate].apply(this._sqlSelectObject, arguments) 
    }
  })
  
  
  function cleanRow(rawObject, disambiguatingColumnNamesInOrder) {
    return _.map(disambiguatingColumnNamesInOrder, function(columnName){return rawObject[columnName]})
  }
  
  function getDisambiguatingColumnNamesInOrder(self) {
    return _.map(self._sqlSelectObject.attributes().toColumns(), function(col){return col.disambiguatingName})
  }
  
  p.rowsSync = function() {
    var disambiguatingColumnNamesInOrder = getDisambiguatingColumnNamesInOrder(this)
    var rawObjects = this._db.query(this._sqlSelectObject.toStatement())
    return _.map(rawObjects, function(rawObject){
      return cleanRow(rawObject, disambiguatingColumnNamesInOrder)
    })    
  }
  
  p.rowsAsync = function(rowCallback) {
    var disambiguatingColumnNamesInOrder = getDisambiguatingColumnNamesInOrder(this)
    this._db.query(this._sqlSelectObject.toStatement(), function(rawObject){
      if (rawObject==null) {
        rowCallback(null)
      } else {
        rowCallback(cleanRow(rawObject, disambiguatingColumnNamesInOrder))        
      }
    })
  }

  F.expressionCompiler = function(db) {
    return function(expression) {
      return new knit.ExecutableRelation(new F(expression.toSql(), db))
    }
  }
  
  return F
}()
