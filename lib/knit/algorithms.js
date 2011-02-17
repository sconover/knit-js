require("knit/core")

knit.algorithms = (function(){
  var _ = knit._util,
      functionsForExport = {}
  
  function select(compiledRelation, predicate) {
    var attributes = compiledRelation.attributes()
    var matchingRows = _.select(compiledRelation.rows(), function(row){
                         return predicate.match(attributes, row)
                       })        
    return {attributes:attributes, rows:matchingRows}
  }
  functionsForExport.select = select
  
  function project(compiledRelation, keepAttributes) {
    var positionsToKeep = compiledRelation.attributes().indexesOf(keepAttributes)
        projectedRows = _.map(compiledRelation.rows(), function(row) {
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
    var combinedAttributes = relationOne.attributes().concat(relationTwo.attributes())           
    
    var combinedRows = 
      joinRows(
        combinedAttributes,
        relationOne.rows(),
        relationTwo.rows(),
        predicate,
        function(leftRow, rightRow){return [].concat(leftRow).concat(rightRow)}
      )

    return {attributes:combinedAttributes, rows:combinedRows}
  }
  functionsForExport.join = join
  
  return functionsForExport
})()