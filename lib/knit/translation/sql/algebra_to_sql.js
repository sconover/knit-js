require("knit/translation/sql/base")

;(function(){
  var _ = knit._util,
      sql = knit.translation.sql,
      ToSqlFunction = function(innerFunction) {
        return function(statementInProgress) {
          statementInProgress = statementInProgress || new sql.Select()
          _.bind(innerFunction, this)(statementInProgress)
          return statementInProgress
        }
      }

  knit.Attributes.prototype.toColumns = function(){ return this.map(function(attr){return sql.Column.fromAttribute(attr)}) } 
  knit.RelationReference.prototype.toSql = ToSqlFunction(function(select){ 
    select.from(this._relation) 
  })

  knit.algebra.Project.prototype.toSql = ToSqlFunction(function(select){ 
    this.relation.toSql(select).what(this.attributes().toColumns())
  })

  knit.algebra.Select.prototype.toSql = ToSqlFunction(function(select){ 
    this.relation.toSql(select).where(this.predicate.toSql())
  })
  knit.algebra.predicate.Conjunction.prototype.toSql = function(){ 
    return new sql.predicate.And(this.leftPredicate.toSql(), this.rightPredicate.toSql())
  }  
  knit.algebra.predicate.Equality.prototype.toSql = function(){ 
    return new sql.predicate.Equals(this.leftIsAttribute() ? sql.Column.fromAttribute(this.leftAtom) : this.leftAtom, 
                                    this.rightIsAttribute() ? sql.Column.fromAttribute(this.rightAtom) : this.rightAtom)
  }

  knit.algebra.Order.prototype.toSql = ToSqlFunction(function(select){ 
    this.relation.toSql(select).order(
      new sql.Order(sql.Column.fromAttribute(this.orderAttribute), 
                    this.direction == knit.algebra.Order.DESC ? sql.Order.DESC: sql.Order.ASC)
    )
  })

  knit.algebra.Join.prototype.toSql = ToSqlFunction(function(select){ 
    select.join(new sql.Join(this.relationOne.toSql()._froms[0], 
                             this.relationTwo.toSql()._froms[0],
                             this.predicate.isSame(new knit.algebra.predicate.True()) ? null : this.predicate.toSql()))
  })
  
})()
