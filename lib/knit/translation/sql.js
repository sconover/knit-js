require("knit/algebra")

knit.translation.sql = function(){
  var _ = knit._util
  var _A = CollectionFunctions.Array.functions
  
  var What = function(whats){}
  var Wildcard = function(){}
  var Column = function(name){this._name = name}
  var From = function(tableName){this._tableName = tableName}

  var Select = function() {
    var F = function(){
      this._whats = []
      this._froms = []
    }; var p = F.prototype
    
    p.what = function(){ 
      this._whats = _A.flatten(this._whats.concat(_A.toArray(arguments)))
      return this 
    }
    
    p.from = function(tableName){ 
      this._froms.push(new From(tableName))
      return this 
    }
    return F
  }()
  

  var ToSqlFunction = function(innerFunction) {
    return function(statementInProgress) {
      statementInProgress = statementInProgress || new Select()
      _.bind(innerFunction, this)(statementInProgress)
      return statementInProgress
    }
  }

  knit.RelationReference.prototype.name = function(){return this._relation.name()} 
  knit.RelationReference.prototype.toSql = 
    ToSqlFunction(function(select){ 
      select.from(this._relation.name()) 
    })
  
  knit.algebra.Project.prototype.name = function(){return this.relation.name()}   
  knit.algebra.Project.prototype.toSql = 
    ToSqlFunction(function(select){ 
      var select = this.relation.toSql(select)
      
      var relationName = this.relation.name()
      select.what(_A.map(this.attributes().names(), function(name){return new Column(relationName + "." + name)})) 
    })
  
  return {Select:Select, 
          What:What, Column:Column, Wildcard:Wildcard, 
          From:From}
}()

