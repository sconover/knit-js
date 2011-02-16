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
    var tables = 
      _.empty(this._sqlSelectObject._joins) ?
        this._sqlSelectObject._froms :
        _.uniq(_.flatten(_.map(this._sqlSelectObject._joins, function(join){return [join.left, join.right]})))
    return _.map(tables, function(table){return table.name()}).join("__")
  }
  
  function rowToObject(row, attributeNames) {
    var object = {}
    _.each(attributeNames, function(attributeName, i){
      object[attributeName] = row[i]
    })
    return object
  }
  
  p.objects = function(objectCallback) {
    var attributeNames = this.attributes().names()
    var rowConverter = function(row){ return rowToObject(row, attributeNames) }
    if (objectCallback) {
      this.rows(function(row){
        if (row == null) {
          objectCallback(null)
        } else {
          objectCallback(rowConverter(row))
        }
      })
    } else {
      return _.map(this.rows(), rowConverter)
    }
  }
  
  function cleanRow(rawObject, disambiguatingColumnNamesInOrder) {
    return _.map(disambiguatingColumnNamesInOrder, function(columnName){return rawObject[columnName]})
  }
  
  function getDisambiguatingColumnNamesInOrder(self) {
    return _.map(self.attributes().toColumns(), function(col){return col.disambiguatingName})
  }
  
  function rowsSync(self) {
    var disambiguatingColumnNamesInOrder = getDisambiguatingColumnNamesInOrder(self)
    var rawObjects = self._db.query(self._sqlSelectObject.toStatement())
    return _.map(rawObjects, function(rawObject){
      return cleanRow(rawObject, disambiguatingColumnNamesInOrder)
    })    
  }
  
  function rowsAsync(self, rowCallback) {
    var disambiguatingColumnNamesInOrder = getDisambiguatingColumnNamesInOrder(self)
    self._db.query(self._sqlSelectObject.toStatement(), function(rawObject){
      if (rawObject==null) {
        rowCallback(null)
      } else {
        rowCallback(cleanRow(rawObject, disambiguatingColumnNamesInOrder))        
      }
    })
  }
  
  p.rows = function(rowCallback) {
    if (rowCallback) {
      rowsAsync(this, rowCallback)
    } else {
      return rowsSync(this)
    }
  }
  
  F.expressionCompiler = function(db) {
    return function(expression) {
      return new F(expression.toSql(), db)
    }
  }
  
  return F
}()
