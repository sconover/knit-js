require("knit/algebra")

knit.translation.sql = function(){
  var _ = knit._util
  var _A = CollectionFunctions.Array.functions
  
  var Wildcard = function(){}
  var Column = function(name){this._name = name}
  var Join = function(left, right, predicate){this._left = left; this._right = right; this._predicate = predicate}
  var Order = function(column, direction){this._column = column; this._direction = direction}
  Order.ASC = "asc"
  Order.DESC = "desc"
  var predicate = {}
  predicate.Equals = function(left, right){this._left = left; this._right = right}
  predicate.And = function(left, right){this._left = left; this._right = right}
  
  var Select = function() {
    var F = function(){
      this._whats = []
      this._froms = []
      this._joins = []
      this._wheres = []
      this._orders = []
    }; var p = F.prototype
    
    p.what = function(){ this._whats = _A.flatten(this._whats.concat(_A.toArray(arguments))); return this }
    p.from = function(tableName){ this._froms.push(tableName); return this }
    p.join = function(){ this._joins = _A.flatten(this._joins.concat(_A.toArray(arguments))); return this }
    p.where = function(predicate){ this._wheres.push(predicate); return this }
    p.order = function(){ this._orders = _A.flatten(this._orders.concat(_A.toArray(arguments))); return this }
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
  knit.RelationReference.prototype.toSql = ToSqlFunction(function(select){ 
    select.from(this._relation.name()) 
  })
  
  knit.algebra.Project.prototype.toSql = ToSqlFunction(function(select){ 
    this.relation.toSql(select).what(this.attributes().toColumns())
  })
  
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

  knit.algebra.Order.prototype.toSql = ToSqlFunction(function(select){ 
    this.relation.toSql(select).order(
      new Order(attributeToColumn(this.orderAttribute), 
                this.direction == knit.algebra.Order.DESC ? Order.DESC: Order.ASC)
    )
  })
  
  knit.algebra.Join.prototype.toSql = ToSqlFunction(function(select){ 
    select.join(new Join(this.relationOne.toSql()._froms[0], 
                         this.relationTwo.toSql()._froms[0],
                         this.predicate.toSql()))
  })
  

  
  return {Select:Select, 
          Column:Column, Wildcard:Wildcard, 
          Join:Join,
          predicate:predicate,
          Order:Order}
}()

