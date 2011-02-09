require("knit/translation/sql/base")

;(function(){
  var _ = knit._util
  var _A = CollectionFunctions.Array.functions
  var sql = knit.translation.sql
  
  sql.Column.prototype.toString = function(){return this._name}
  sql.Wildcard.prototype.toString = function(){return "*"}
  
  sql.Select.prototype.toStatement = function() {
    var self = this
    
    function selectClause() {
      var whats = _A.empty(self._whats) ? [new sql.Wildcard()] : self._whats
      return _A.map(whats, function(what){return what.toString()}).join(", ")
    }
    function from() { return self._froms.join(", ") }
    
    return {
      sql:"select " + selectClause() + " from " + from()
    }
  }
  
})()

//   var ToSqlFunction = function(innerFunction) {
//     return function(statementInProgress) {
//       statementInProgress = statementInProgress || new sql.Select()
//       _.bind(innerFunction, this)(statementInProgress)
//       return statementInProgress
//     }
//   }
// 
//   function attributeToColumn(attr) { return new sql.Column(attr.sourceRelation().name() + "." + attr.name()) }
//   knit.Attributes.prototype.toColumns = function(){ return this.map(function(attr){return attributeToColumn(attr)}) } 
//   knit.RelationReference.prototype.toSql = ToSqlFunction(function(select){ 
//     select.from(this._relation.name()) 
//   })
// 
//   knit.algebra.Project.prototype.toSql = ToSqlFunction(function(select){ 
//     this.relation.toSql(select).what(this.attributes().toColumns())
//   })
// 
//   knit.algebra.Select.prototype.toSql = ToSqlFunction(function(select){ 
//     this.relation.toSql(select).where(this.predicate.toSql())
//   })
//   knit.algebra.predicate.Conjunction.prototype.toSql = function(){ 
//     return new sql.predicate.And(this.leftPredicate.toSql(), this.rightPredicate.toSql())
//   }  
//   knit.algebra.predicate.Equality.prototype.toSql = function(){ 
//     return new sql.predicate.Equals(this.leftIsAttribute() ? attributeToColumn(this.leftAtom) : this.leftAtom, 
//                                 this.rightIsAttribute() ? attributeToColumn(this.rightAtom) : this.rightAtom)
//   }
// 
//   knit.algebra.Order.prototype.toSql = ToSqlFunction(function(select){ 
//     this.relation.toSql(select).order(
//       new sql.Order(attributeToColumn(this.orderAttribute), 
//                     this.direction == knit.algebra.Order.DESC ? sql.Order.DESC: sql.Order.ASC)
//     )
//   })
// 
//   knit.algebra.Join.prototype.toSql = ToSqlFunction(function(select){ 
//     select.join(new sql.Join(this.relationOne.toSql()._froms[0], 
//                              this.relationTwo.toSql()._froms[0],
//                              this.predicate.toSql()))
//   })
//   
