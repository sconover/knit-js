require("../helper")
require("knit/core")
engine = typeof engine == "undefined" ? {} : engine

acceptanceTest = function() {
  var _ = knit._util,
      args = _.toArray(arguments),
      name = args.shift(),
      jasmineFunction = args.pop(),
      engines = args
  
  _.each(engines, function(anEngine){
    if (anEngine) {
      describe("engine=" + anEngine.name + " " + name, function(){
        beforeEach(function(){ anEngine.setup(this) })
        afterEach(function(){ if (anEngine.tearDown) anEngine.tearDown(this) })
      
        jasmineFunction()
      })
    }
  })
}

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
  var compiled = relation.compile()
  return {
   name:compiled.name(),
   attributes:getAttributes(compiled),
   rows:compiled.rows()
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
  var compiled = relation.compile()
  expect(expected.name).toEqual(compiled.name())
  expect(expected.attributes).toEqual(getAttributes(compiled))
  expect(expected.rows).toBeTheEquivalentSetOf(compiled.rows())
  
  if (compiled._executionStrategy.rowsAsync) {
    //talk to davis and xian about async
    var rowsAsync = []
    compiled.rows(function(row) {
      if (row === null) {
        expect(expected.rows).toBeTheEquivalentSetOf(rowsAsync)
      } else {
        rowsAsync.push(row)
      }
    })    
  }
  
}


