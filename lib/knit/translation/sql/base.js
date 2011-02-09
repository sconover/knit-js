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
    
    _A.each(["what", "from", "join", "where", "order"], function(appenderMethodName){
      var localName = "_" + appenderMethodName + "s"
      p[appenderMethodName] = 
        function(){ this[localName] = _A.flatten(this[localName].concat(_A.toArray(arguments))); return this }
    })
    return F
  }()
  
  return {Select:Select, 
          Column:Column, Wildcard:Wildcard, 
          Join:Join,
          predicate:predicate,
          Order:Order}
}()