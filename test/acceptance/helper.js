require("../helper")

require("knit/engine/memory")
require("knit/engine/sqlite")

engine = {
  
  memory: {
    name:"memory",
    setup: function(target) {
      knit._util.bind(setupAcceptanceFixtures, target)(knit.engine.memory.createRelation)
    }
  },
  
  sqlite: {
    name:"sqlite",
    setup: function(target) {
      target.db = new knit.engine.sqlite.Database(":memory:")
      target.db.open()
      knit._util.bind(setupAcceptanceFixtures, target)(knit._util.bind(target.db.createTable,target.db))
    },
    tearDown: function(target) {
      target.db.close()
    }
  }
  
}

acceptanceTest = function() {
  var _ = knit._util,
      args = _.toArray(arguments),
      name = args.shift(),
      jasmineFunction = args.pop(),
      engines = args
  
  _.each(engines, function(engine){
    describe("engine=" + engine.name + " " + name, function(){
      beforeEach(function(){ engine.setup(this) })
      afterEach(function(){ if (engine.tearDown) engine.tearDown(this) })
      
      jasmineFunction()
    })
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
  //transitional
  var compiled = relation.compile()
  assert.equal(expected.name, compiled.name())
  assert.equal(expected.attributes, getAttributes(compiled))
  assert.setsEqual(expected.rows, compiled.rows())
  
  if (compiled._executionStrategy.rowsAsync) {
    //talk to davis and xian about async
    var rowsAsync = []
    compiled.rows(function(row) {
      if (row==null) {
        assert.setsEqual(expected.rows, rowsAsync)
      } else {
        rowsAsync.push(row)
      }
    })    
  } else {
    console.log("D")
  }
  
}


