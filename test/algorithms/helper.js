require("../helper")

compiledRelation = function(attributeNames, arrayOfRows) {
  var _ = knit._util,
      attributeNamesAndTypes = _.map(attributeNames, function(attributeName){return [attributeName, knit.attributeType.String]}),
                                 //^^ types don't matter for our purposes here
      testRelation = new TestRelation(attributeNamesAndTypes)
  testRelation.rows = function(rowFunction){
    if (rowFunction) {
      _.each(arrayOfRows, rowFunction)
      rowFunction(null)
    } else {
      return arrayOfRows
    }
  }
  return testRelation
}
