require("knit/algebra")

knit.translation.sql = function(){
  var _ = knit._util
  var _A = CollectionFunctions.Array.functions
  
  var Wildcard = function(){}
  var Column = function(name){this._name = name}
  var From = function(tableName){this._tableName = tableName}
  var predicate = {}
  predicate.Equals = function(left, right){this._left = left; this._right = right}
  predicate.And = function(left, right){this._left = left; this._right = right}
  
  var Select = function() {
    var F = function(){
      this._whats = []
      this._froms = []
      this._wheres = []
    }; var p = F.prototype
    
    p.what = function(){ this._whats = _A.flatten(this._whats.concat(_A.toArray(arguments))); return this }
    p.from = function(tableName){ this._froms.push(new From(tableName)); return this }
    p.where = function(predicate){ this._wheres.push(predicate); return this }
    return F
  }()
  

  var ToSqlFunction = function(innerFunction) {
    return function(statementInProgress) {
      statementInProgress = statementInProgress || new Select()
      _.bind(innerFunction, this)(statementInProgress)
      return statementInProgress
    }
  }

  function attributeToColumn(attr) {
    return new Column(attr.sourceRelation().name() + "." + attr.name())
  }
  knit.Attributes.prototype.toColumns = function(){
    return this.map(function(attr){return attributeToColumn(attr)})
  } 
  knit.RelationReference.prototype.name = function(){return this._relation.name()} 
  knit.RelationReference.prototype.toSql = ToSqlFunction(function(select){ 
    select.from(this._relation.name()) 
  })
  
  knit.algebra.Project.prototype.name = function(){return this.relation.name()}   
  knit.algebra.Project.prototype.toSql = ToSqlFunction(function(select){ 
    this.relation.toSql(select).what(this.attributes().toColumns())
  })
  
  knit.algebra.Select.prototype.name = function(){return this.relation.name()}   
  knit.algebra.Select.prototype.toSql = ToSqlFunction(function(select){ 
    this.relation.toSql(select).where(this.predicate.toSql())
  })
  knit.algebra.predicate.Conjunction.prototype.toSql = function(){ 
    return new predicate.And(this.leftPredicate.toSql(), this.rightPredicate.toSql())
  }  
  knit.algebra.predicate.Equality.prototype.toSql = function(){ 
    return new predicate.Equals(this.leftIsAttribute() ? attributeToColumn(this.leftAtom) : this.leftAtom, 
                                this.rightIsAttribute() ? attributeToColumn(this.rightAtom) : this.rightAtom)
  }
  
  return {Select:Select, 
          Column:Column, Wildcard:Wildcard, 
          From:From,
          predicate:predicate}
}()

