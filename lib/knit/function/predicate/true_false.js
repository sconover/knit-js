require("knit/core")

_.each([{klass:"True", localName:"TRUE"}, {klass:"False", localName:"FALSE"}], function(meta) {

  knit.function.predicate[meta.klass] = function() {
  }

  _.extend(knit.function.predicate[meta.klass].prototype, {
    isSame: function(other) {
      return other.constructor == knit.function.predicate[meta.klass]
    },
    
    inspect: function() {return meta.localName}
  })

  knit.function.predicate[meta.klass].prototype.isEquivalent = 
    knit.function.predicate[meta.klass].prototype.isSame

  knit.locals[meta.localName] = new knit.function.predicate[meta.klass]()
  
})