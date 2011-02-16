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
  
  p.objects = function() {
    var attributeNames = this.attributes().names()
    return _.map(this.rows(), function(row){
      var object = {}
      _.each(attributeNames, function(attributeName, i){
        object[attributeName] = row[i]
      })
      return object
    })
  }
  p.rows = function() {
    var rowsWithSpecialColumnNames = this._db.query(this._sqlSelectObject.toStatement())
    var disambiguatingColumnNamesInOrder = _.map(this.attributes().toColumns(), 
                                                 function(col){return col.disambiguatingName})
    return _.map(rowsWithSpecialColumnNames, function(row){
      return _.map(disambiguatingColumnNamesInOrder, function(columnName){return row[columnName]})
    })
  }
  
  F.expressionCompiler = function(db) {
    return function(expression) {
      return new F(expression.toSql(), db)
    }
  }
  
  return F
}()
