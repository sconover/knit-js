require("knit/executable_relation")
require("knit/translation/algebra_to_algorithm")
//UseAlgorithms quacksLike execution strategy
knit.UseAlgorithms = function() {
  var _ = knit._util,
      F = function(relationFunction) {
            this._relationFunction = relationFunction
          },
      p = F.prototype
  
  
  
  p._getRelationResult = function(){
    this._relationResult = this._relationResult || this._relationFunction()
    return this._relationResult
  }
  
  _.each(["name", "attributes", "attr", "inspect", 
          "merge", "split", "newNestedAttribute", "isEquivalent", "isSame"], function(methodNameToDelegate) {
    p[methodNameToDelegate] = function() { 
      return this._getRelationResult()[methodNameToDelegate].apply(this._getRelationResult(), arguments) 
    }
  })
  
  p.rowsSync = function() {
    return this._getRelationResult().rows()
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
    
  
  F.expressionCompiler = function() {
    return function(expression) {
      return new knit.ExecutableRelation(new F(expression.toAlgorithm()))
    }
  }
  
  return F
}()
