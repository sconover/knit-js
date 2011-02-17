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
  
  return functionsForExport
})()