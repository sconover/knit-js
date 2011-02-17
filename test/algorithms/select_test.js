require("../test_helper.js")
require("knit/algorithms")
require("../test_relation.js")

regarding("select - filter rows based on a predicate", function() {
  var _ = knit._util,
      f = knit.algorithms,
      type = knit.attributeType
  
  function compiledRelation(attributeNames, arrayOfRows) {
    var attributeNamesAndTypes = _.map(attributeNames, function(attributeName){return [attributeName, type.String]})
                                   //^^ types don't matter for our purposes here
    var testRelation = new TestRelation(attributeNamesAndTypes)
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
  
  test("array form", function(){
    var relation = compiledRelation(["id", "color"], [[1, "red"],[2, "blue"],[3, "blue"]])

    assert.deepSame(
      {attributes:relation.attributes().get("id", "color"), rows:[[2, "blue"],[3, "blue"]]},
      f.select(relation, new knit.algebra.predicate.Equality(relation.attr("color"), "blue"))
    )
    
    assert.deepSame(
      {attributes:relation.attributes().get("id", "color"), rows:[[1, "red"]]},
      f.select(relation, new knit.algebra.predicate.Equality(relation.attr("color"), "red"))
    )

    assert.deepSame(
      {attributes:relation.attributes().get("id", "color"), rows:[]},
      f.select(relation, new knit.algebra.predicate.Equality(relation.attr("color"), "PURPLE"))
    )
  })
  
})

