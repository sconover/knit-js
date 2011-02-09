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
  
  return {Select:Select, 
          Column:Column, Wildcard:Wildcard, 
          Join:Join,
          predicate:predicate,
          Order:Order}
}()