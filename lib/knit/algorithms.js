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
  
  return functionsForExport
})()