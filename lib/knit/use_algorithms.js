require("knit/executable_relation")
require("knit/translation/algorithm")
//UseAlgorithms quacksLike execution strategy
knit.UseAlgorithms = function() {
  var _ = knit._util,
      C = function(algorithmFunction) {
            this._algorithmFunction = algorithmFunction
          },
      p = C.prototype
  
  p._getRelationResult = function(){
    this._relationResult = this._relationResult || this._algorithmFunction()
    return this._relationResult
  }
  
  _.each(["name"], function(methodNameToDelegate) {
    p[methodNameToDelegate] = function() { 
      return this._getRelationResult()[methodNameToDelegate].apply(this._getRelationResult(), arguments) 
    }
  })
  
  _.delegate(p, knit.signature.relation, function(){return this._getRelationResult()})
  
  p.cost = function() { if(!this._getRelationResult().cost) console.log(this._getRelationResult()); return this._getRelationResult().cost() }
  p.rowsSync = function() { return this._getRelationResult().rows() }
  
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
    
  
  C.expressionCompiler = function() {
    return function(expression) {
      return new knit.ExecutableRelation(new C(expression.toAlgorithm()))
    }
  }
  
  return C
}()
