require("./helper")

assert.rawRelationEqual = function(expected, actual) {
  var withoutCostActual = {}
  for(var k in actual) if (k!="cost") withoutCostActual[k] = actual[k]
  
  expect(expected).toEqual(withoutCostActual)
}


