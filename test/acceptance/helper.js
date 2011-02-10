require("../test_helper.js")

feature = {}

setupAcceptanceFixtures = function(createRelation) {
  setupPersonHouseCity(this, createRelation)

  this.createRelation = createRelation

  this.person.merge([
    [1, 101, "Jane", 5],
    [2, 101, "Puck", 12],
    [3, 102, "Fanny", 30],
    [4, 103, "Amy", 6]
  ])
  
  this.house.merge([
    [101, "Chimney Hill", 1001],
    [102, "Parnassus", 1001],
    [103, "Canal", 1002]
  ])

  this.city.merge([
    [1001, "San Francisco"],
    [1002, "New Orleans"]
  ])
  
}

relationContents = function(relation) {
  return {
   name:relation.name(),
   attributes:getAttributes(relation),
   rows:relation.rows()
  }
}

getAttributes = function(relation) {
  return relation.attributes().map(function(attribute){
    if (attribute.nestedRelation) {
      var mapping = {}
      mapping[attribute.name()] = getAttributes(attribute.nestedRelation())
      return mapping
    } else {
      return attribute.name()
    }
  })
}

assert.relationEqual = function(expected, relation) {
  assert.equal(expected.name, relation.name())
  assert.equal(expected.attributes, getAttributes(relation))
  assert.setsEqual(expected.rows, relation.rows())
}


