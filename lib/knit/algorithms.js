require("knit/namespace")
require("knit/core/util")

knit.algorithms = (function(){
  var _ = knit._util
  
  function select(relation, predicate) {
    var matchingRows = _.select(relation.rows, function(row){
                         return predicate(row)
                       })        
    return {attributes:relation.attributes, rows:matchingRows}
  }
  
  function project(relation, keepAttributes) {
    var positionsToKeep = _.indexesOf(relation.attributes, keepAttributes)
        projectedRows = _.map(relation.rows, function(row) {
                          return _.map(positionsToKeep, function(position) {
                            return row[position]
                          })
                        })
    return {attributes:keepAttributes, rows:projectedRows}
  }

  function orderAsc(relation, orderAttribute) {
    var columnNumber = _.indexOf(relation.attributes, orderAttribute),
        sortedRows = _.sortBy(relation.rows, function(row){ return row[columnNumber] })

    return {attributes:relation.attributes, rows:sortedRows}
  }

  function orderDesc(relation, orderAttribute) {
    return {attributes:relation.attributes, rows:orderAsc(relation, orderAttribute).rows.reverse()}
  }



  function joinRows(combinedAttributes, outerRows, innerRows, predicate, candidateJoinRowFunction, 
                    innerAttributes, noInnerMatchFoundFunction) {
    var resultRows = []
    
    _.each(outerRows, function(outerRow){
      var innerRowMatchFound = false
      _.each(innerRows, function(innerRow){
        var candidateJoinRow = candidateJoinRowFunction(outerRow, innerRow) 
        if (predicate(candidateJoinRow)) {
          resultRows.push(candidateJoinRow)
          innerRowMatchFound = true
        }
      })
      
      if ( noInnerMatchFoundFunction && ! innerRowMatchFound) {
        noInnerMatchFoundFunction(innerAttributes, outerRow, resultRows)
      }
    })

    return resultRows
  }
  
  var TRUE_PREDICATE = function(){return true}
  
  function join(relationOne, relationTwo, predicate) {
    predicate = predicate || TRUE_PREDICATE
    var combinedAttributes = relationOne.attributes.concat(relationTwo.attributes)           
    
    var combinedRows = 
      joinRows(
        combinedAttributes,
        relationOne.rows,
        relationTwo.rows,
        predicate,
        function(leftRow, rightRow){return [].concat(leftRow).concat(rightRow)}
      )

    return {attributes:combinedAttributes, rows:combinedRows}
  }
  
  function leftOuterJoin(relationOne, relationTwo, predicate) {
    predicate = predicate || TRUE_PREDICATE
    var combinedAttributes = relationOne.attributes.concat(relationTwo.attributes)           
    
    var combinedRows = 
      joinRows(
        combinedAttributes,
        relationOne.rows,
        relationTwo.rows,
        predicate,
        function(leftRow, rightRow){return [].concat(leftRow).concat(rightRow)},
        relationTwo.attributes,
        function(rightAttributes, leftRow, joinRows){
          var rightAsNulls = _.repeat([null], rightAttributes.length),
              leftRowWithNullRightValues = [].concat(leftRow).concat(rightAsNulls)
          joinRows.push(leftRowWithNullRightValues)
        }
      )

    return {attributes:combinedAttributes, rows:combinedRows}
  }
  
  function rightOuterJoin(relationOne, relationTwo, predicate) {
    predicate = predicate || TRUE_PREDICATE
    var combinedAttributes = relationOne.attributes.concat(relationTwo.attributes)           
    
    var combinedRows = 
      joinRows(
        combinedAttributes,
        relationTwo.rows,
        relationOne.rows,
        predicate,
        function(rightRow, leftRow){return [].concat(leftRow).concat(rightRow)},
        relationOne.attributes,
        function(leftAttributes, rightRow, joinRows){
          var leftAsNulls = [],
              leftAsNulls = _.repeat([null], leftAttributes.length),
              rightRowWithNullLeftValues = [].concat(leftAsNulls).concat(rightRow)
          joinRows.push(rightRowWithNullLeftValues)
        }
      )

    return {attributes:combinedAttributes, rows:combinedRows}
  }
  
  return {select:select, 
          project:project, 
          join:join, leftOuterJoin:leftOuterJoin, rightOuterJoin:rightOuterJoin,
          orderAsc:orderAsc, orderDesc:orderDesc}
})()