require("knit/core")

knit.translation.sql = function(){
  var _ = knit._util
  
  var What = function(whats){}
  var Star = function(){}
  var From = function(tableName){this._tableName = tableName}

  var Select = function() {
    var F = function(){
      this._froms = []
    }; var p = F.prototype
    p.what = function(){ return this }
    p.from = function(tableName){ this._froms.push(new From(tableName)); return this }
    return F
  }()
  

  var ToSqlFunction = function(innerFunction) {
    return function(statementInProgress) {
      statementInProgress = statementInProgress || new Select()
      _.bind(innerFunction, this)(statementInProgress)
      return statementInProgress
    }
  }

  knit.RelationReference.prototype.toSql = 
    ToSqlFunction(function(select){ select.from(this._relation.name()) })
  
  return {Select:Select, What:What, Star:Star, From:From}
}()

