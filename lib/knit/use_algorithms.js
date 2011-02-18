require("knit/executable_relation")
//UseAlgorithms quacksLike execution strategy
knit.UseAlgorithms = function() {
  var _ = knit._util,
      F = function(attributesFunction, rowsSyncFunction) {
            this._attributesFunction = attributesFunction
            this.rowsSync = rowsSyncFunction
          },
      p = F.prototype
  
  p.name = function(){
    //bad
    // var tables = 
    //   _.empty(this._sqlSelectObject._joins) ?
    //     this._sqlSelectObject._froms :
    //     _.uniq(_.flatten(_.map(this._sqlSelectObject._joins, function(join){return [join.left, join.right]})))
    // return _.map(tables, function(table){return table.name()}).join("__")
  }
  
  _.each(["attributes", "columns", "attr", "inspect", 
          "merge", "split", "newNestedAttribute", "isEquivalent", "isSame"], function(methodNameToDelegate) {
    p[methodNameToDelegate] = function() { 
      return this._sqlSelectObject[methodNameToDelegate].apply(this._sqlSelectObject, arguments) 
    }
  })

  p.rowsSync = function() {
    return this._rowsSyncFunction()
  }
    
  // p.rowsAsync = function(rowCallback) {
  //   var disambiguatingColumnNamesInOrder = getDisambiguatingColumnNamesInOrder(this)
  //   this._db.query(this._sqlSelectObject.toStatement(), function(rawObject){
  //     if (rawObject==null) {
  //       rowCallback(null)
  //     } else {
  //       rowCallback(cleanRow(rawObject, disambiguatingColumnNamesInOrder))        
  //     }
  //   })
  // }
  
  function compile(expression) {
    
    function newRelation(rows, name, attributes) {
      //curry?
      return new knit.engine.memory.Relation(newName, newAttributes, [], rows, 0 + rows.length) 
    }
    
    
    function compileSelect(selectExpression) {
      var attributes = selectExpression.attributes(),
          rawPredicate = function(row) { return predicate.match(attributes, row) },
          result = knit.algorithms.select({attributes:attributes.names(), rows:selectExpression.relation.rows()}, rawPredicate)
      return newRelation(result.rows, this.name(), attributes) 
    }

    
    if (expression instanceof knit.algebra.Select) {
      
    }
    
    p.performProject = function(keepAttributes) {
      var result = knit.algorithms.project({attributes:this.attributes().fullyQualifiedNames(), rows:this.rows()}, keepAttributes.fullyQualifiedNames())
      return this._newRelation(result.rows, this.name(), keepAttributes) 
    }
    
  }
  
  F.expressionCompiler = function(db) {
    return function(expression) {
      return new knit.ExecutableRelation(new F(compile(expression)))
    }
  }
  
  return F
}()
