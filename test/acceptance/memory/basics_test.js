require("../helper")
require("knit/engine/memory")

regarding("In Memory Engine", function() {
    
  beforeEach(function() {
    knit.bind(setupAcceptanceFixtures, this)(new knit.engine.Memory())
  })

  regarding("Basics", function() {

    test("insert, read", function (){
      
      assert.equal([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30],
        [4, 103, "Amy", 6]
      ], this.person.rows())
      
      this.person.merge([
        [5, 102, "Simon", 1]
      ])

      assert.equal([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30],
        [4, 103, "Amy", 6],
        [5, 102, "Simon", 1]
      ], this.person.rows())
    })
    
    test("primary key - replace rows a row if it's a dup", function (){
      var person2 = this.engine.createRelation("person", ["personId", "houseId", "name", "age"], ["personId"])

      person2.merge([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30]
      ])
      
      assert.equal([
        [1, 101, "Jane", 5],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30]
      ], person2.rows())
      
      person2.merge([
        [1, 101, "Jeanne", 6]
      ])

      assert.equal([
        [1, 101, "Jeanne", 6],
        [2, 101, "Puck", 12],
        [3, 102, "Fanny", 30]
      ], person2.rows())
    })
    
  })
})