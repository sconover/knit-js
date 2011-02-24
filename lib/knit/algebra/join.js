require("knit/core")
require("knit/algebra/predicate")

knit.algebra.Join = (function(){

  var C = function(relationOne, relationTwo, predicate) {
            this.relationOne = relationOne
            this.relationTwo = relationTwo
            this.predicate = predicate || new knit.algebra.predicate.True()
          },
      p = C.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.operationName = function(){return "join"}
  
  p.newNestedAttribute = function() {    
    return this.relationOne.newNestedAttribute.apply(this.relationOne, arguments)
  }
  
  p.defaultCompiler = function(){ return this.relationOne.defaultCompiler() }

  p.attributes = function(){ return this.relationOne.attributes().concat(this.relationTwo.attributes()) }
  
  p._predicateIsDefault = function() {
    return this.predicate.isSame(new knit.algebra.predicate.True())
  }
  
  p.appendToPredicate = function(additionalPredicate) {
    if (this._predicateIsDefault()) {
      this.predicate = additionalPredicate
    } else {
      this.predicate = new knit.algebra.predicate.Conjunction(this.predicate, additionalPredicate)
    }
    return this
  }

  p.isSame = function(other) {
    return other.constructor == C && 
           this.relationOne.isSame(other.relationOne) &&
           this.relationTwo.isSame(other.relationTwo) &&
           this.predicate.isSame(other.predicate)
  }
 
  p.isEquivalent = function(other) {
    return this.isSame(other) ||
             other.constructor == C && 

             ((this.relationOne.isSame(other.relationOne) &&
              this.relationTwo.isSame(other.relationTwo)) ||

             (this.relationOne.isSame(other.relationTwo) &&
              this.relationTwo.isSame(other.relationOne))) &&

             this.predicate.isEquivalent(other.predicate)
  }
  
  p.inspect = function(){
    var inspectStr = this.operationName() + "(" + this.relationOne.inspect() + "," + this.relationTwo.inspect()
  
    if (!this._predicateIsDefault()) {
      inspectStr += "," + this.predicate.inspect()
    }
  
    inspectStr += ")"
    return inspectStr
  }

  return C
})()

knit.createBuilderFunction.dslLocals.join = function(relationOne, relationTwo, predicate) { 
  return new knit.algebra.Join(relationOne, relationTwo, predicate) 
}

knit.algebra.LeftOuterJoin = (function(){

  var _ = knit._util,
      C = function(relationOne, relationTwo, predicate) {
            this.relationOne = relationOne
            this.relationTwo = relationTwo
            this.predicate = predicate || new knit.algebra.predicate.True()
          },
      p = C.prototype
  
  _.extend(p, knit.algebra.Join.prototype)
  
  p.operationName = function(){return "leftOuterJoin"}
  
  return C
})()

knit.createBuilderFunction.dslLocals.leftOuterJoin = function(relationOne, relationTwo, predicate) { 
  return new knit.algebra.LeftOuterJoin(relationOne, relationTwo, predicate) 
}



knit.algebra.RightOuterJoin = (function(){

  var _ = knit._util,
      C = function(relationOne, relationTwo, predicate) {
            this.relationOne = relationOne
            this.relationTwo = relationTwo
            this.predicate = predicate || new knit.algebra.predicate.True()
          },
      p = C.prototype
  
  _.extend(p, knit.algebra.Join.prototype)
  
  p.operationName = function(){return "rightOuterJoin"}
  
  return C
})()

knit.createBuilderFunction.dslLocals.rightOuterJoin = function(relationOne, relationTwo, predicate) { 
  return new knit.algebra.RightOuterJoin(relationOne, relationTwo, predicate) 
}



knit.algebra.NaturalJoin = (function(){

  var _ = knit._util,
      C = function(relationOne, relationTwo, suffix) {
            this.relationOne = relationOne
            this.relationTwo = relationTwo
            this.suffix = suffix || "Id"
          },
      p = C.prototype
  
  _.extend(p, knit.algebra.Join.prototype)
  
  p.operationName = function(){return "naturalJoin"}
  
  return C
})()

knit.createBuilderFunction.dslLocals.naturalJoin = function(relationOne, relationTwo, suffix) { 
  return new knit.algebra.NaturalJoin(relationOne, relationTwo, suffix) 
}
