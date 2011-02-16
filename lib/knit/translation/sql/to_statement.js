require("knit/translation/sql/base")

;(function(){
  var _ = knit._util,
      sql = knit.translation.sql

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

    function allAttributes() {
      var allAttributes = new knit.Attributes([])
      _.each(self._allTables(), function(table){
        allAttributes = allAttributes.concat(table.attributes())
      })
      return allAttributes
    }
    function selectClause() {
      return _.map(self._whats, function(what){
        return what.toString() + " as " + what.disambiguatingName
                                    //^^^ otherwise house.houseId stomps person.houseId because the 
                                    //    sqlite driver treats rows as sets (js objects).  sigh.
      }).join(", ")
    }
    function from() { 
      return " from " + 
              _.map(self._froms, function(table){
                return table.name()
              }).join(", ") }

    function hasJoin() { return !_.empty(self._joins) }
    function joinStatement() { 
      var combined = {sql:"", values:[]}
      var joinIterator = _.iterator(self._joins)
      while (joinIterator.hasNext()) {
        var join = joinIterator.next()
        if (combined.sql.length==0) combined.sql += "from " + join.left.name()
        combined.sql += " join " + join.right.name()
        if (join.predicate) {
          var statement = join.predicate.toStatement()
          combined.sql += " on " + statement.sql
          combined.values = combined.values.concat(statement.values)
        }
      }
      return combined
    }

    function hasWhere() { return !_.empty(self._wheres) }
    function whereStatement() { 
      function combineWheresWithAnd(wheres) {
        return wheres.length >= 2 ? 
          new sql.predicate.And(wheres[0], combineWheresWithAnd(_.slice(wheres, [1, -1]))) :
          wheres[0]
      }
      return combineWheresWithAnd(self._wheres).toStatement()
    }

    function hasOrder() { return !_.empty(self._orders) }
    function order() { 
      return _.map(self._orders, function(order){
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