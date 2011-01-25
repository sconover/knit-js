require("../test_helper.js")

setupAcceptanceFixtures = function(engine) {
  this.engine = engine
  
  this.person = this.engine.createRelation("person", ["personId", "houseId", "name", "age"])
  this.house = this.engine.createRelation("house", ["houseId", "address", "cityId"])
  this.city = this.engine.createRelation("city", ["cityId", "name"])

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
  
  this.$R = knit.createBuilderFunction({bindings:{
    person:this.person,
    house:this.house,
    city:this.city
  }})    
}

relationContents = function(relation) {
  return {
   name:relation.name(),
   attributes:getAttributes(relation),
   rows:relation.rows()
  }
}

getAttributes = function(relation) {
  return _.map(relation.attributes(), function(attribute){
    if (attribute.nestedRelation) {
      var mapping = {}
      mapping[attribute.name()] = getAttributes(attribute.nestedRelation())
      return mapping
    } else {
      return attribute.name()
    }
  })
}

