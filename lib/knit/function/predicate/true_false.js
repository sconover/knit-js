require("knit/core")

_.each([{klass:"True", localName:"TRUE"}, {klass:"False", localName:"FALSE"}], function(meta) {

  knit.function.predicate[meta.klass] = function() {
  }

  knit.function.predicate[meta.klass].prototype.isSame = function(other) {
    return other.constructor == knit.function.predicate[meta.klass]
  }

  // knit.JoinFunction.prototype.isEquivalent = function(other) {
  //   return this.isSame(other)
  // }

  knit.locals[meta.localName] = new knit.function.predicate[meta.klass]()
  
})