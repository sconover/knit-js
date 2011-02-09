require("knit/translation/sql/base")

;(function(){
  var _ = knit._util
  var _A = CollectionFunctions.Array.functions
  var sql = knit.translation.sql

  function appendStatement(combined, statement) { 
    if (combined.sql.length>=1) combined.sql += " "
    combined.sql += statement.sql
    combined.values = combined.values.concat(statement.values)
  }
  
  sql.Column.prototype.toString = function(){return this.name}
  sql.Wildcard.prototype.toString = function(){return "*"}
  sql.predicate.Equals.prototype.toStatement = function(){
    function appendAtom(atom, stringParts, values) {
      if (atom.constructor == sql.Column) {
        stringParts.push(atom.toString())
      } else {
        stringParts.push("?")
        values.push(atom)
      }
    }
    var parts = []
    var values = []
    appendAtom(this.left, parts, values)
    parts.push("=")
    appendAtom(this.right, parts, values)
    return {sql:parts.join(" "), values:values}
  }  
  sql.predicate.And.prototype.toStatement = function(){
    var combined = {sql:"", values:[]}
    appendStatement(combined, this.left.toStatement())
    combined.sql += " and"
    appendStatement(combined, this.right.toStatement())
    return combined
  }
  
  sql.Select.prototype.toStatement = function() {
    var self = this
    
    function selectClause() {
      var whats = _A.empty(self._whats) ? [new sql.Wildcard()] : self._whats
      return _A.map(whats, function(what){return what.toString()}).join(", ")
    }
    function from() { return " from " + self._froms.join(", ") }

    function hasJoin() { return !_A.empty(self._joins) }
    function joinStatement() { 
      var combined = {sql:"", values:[]}
      var joinIterator = _A.iterator(self._joins)
      while (joinIterator.hasNext()) {
        var join = joinIterator.next()
        if (combined.sql.length==0) combined.sql += "from " + join.left
        combined.sql += " join " + join.right
        if (join.predicate) {
          var statement = join.predicate.toStatement()
          combined.sql += " on " + statement.sql
          combined.values = combined.values.concat(statement.values)
        }
      }
      return combined
    }

    function hasWhere() { return !_A.empty(self._wheres) }
    function whereStatement() { 
      function combineWheresWithAnd(wheres) {
        return wheres.length >= 2 ? 
          new sql.predicate.And(wheres[0], combineWheresWithAnd(_A.slice(wheres, [1, -1]))) :
          wheres[0]
      }
      return combineWheresWithAnd(self._wheres).toStatement()
    }

    function hasOrder() { return !_A.empty(self._orders) }
    function order() { 
      return _A.map(self._orders, function(order){
        return order.column.toString() + (order.direction == sql.Order.DESC ? " desc" : "")
      }).join(", ")
    }
    
    var result = {sql:"", values:[]}
    result.sql += "select " + selectClause()
    if (hasJoin()) {
      appendStatement(result, joinStatement())
    } else {
      result.sql += from()
    }
    if (hasWhere()) {
      result.sql += " where"
      appendStatement(result, whereStatement())
    }
    if (hasOrder()) result.sql += " order by " + order()
    return result
  }
  
})()