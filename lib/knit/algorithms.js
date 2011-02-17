require("knit/namespace")
require("knit/core/util")

knit.algorithms = (function(){
  var _ = knit._util,
      functionsForExport = {}
  
  function select(relation, predicate) {
    var matchingRows = _.select(relation.rows, function(row){
                         return predicate(relation.attributes, row)
                       })        
    return {attributes:relation.attributes, rows:matchingRows}
  }
  functionsForExport.select = select
  
  function project(relation, keepAttributes) {
    var positionsToKeep = _.indexesOf(relation.attributes, keepAttributes)
        projectedRows = _.map(relation.rows, function(row) {
                          return _.map(positionsToKeep, function(position) {
                            return row[position]
                          })
                        })
    return {attributes:keepAttributes, rows:projectedRows}
  }
  functionsForExport.project = project



  function joinRows(combinedAttributes, outerRows, innerRows, predicate, candidateJoinRowFunction, 
                    innerAttributes, noInnerMatchFoundFunction) {
    var resultRows = []
    
    _.each(outerRows, function(outerRow){
      var innerRowMatchFound = false
      _.each(innerRows, function(innerRow){
        var candidateJoinRow = candidateJoinRowFunction(outerRow, innerRow) 
        if (predicate(combinedAttributes, candidateJoinRow)) {
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
  
  var TRUE = function(){return true}
  
  function join(relationOne, relationTwo, predicate) {
    predicate = predicate || TRUE
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
  functionsForExport.join = join
  
  return functionsForExport
})()