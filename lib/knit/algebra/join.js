require("knit/core")
require("knit/algebra/predicate")

knit.algebra.Join = function(){

  var F = function(relationOne, relationTwo, predicate) {
    this.relationOne = relationOne
    this.relationTwo = relationTwo
    this.predicate = predicate || new knit.algebra.predicate.True()
  }
  
  knit.mixin.RowsAndObjects(F.prototype)
  
  F.prototype.newNestedAttribute = function() {
    return this.relationOne.newNestedAttribute.apply(this.relationOne, arguments)
  }
  
  F.prototype.perform = function() {
    return this.relationOne.perform().performJoin(this.relationTwo.perform(), this.predicate)
  }

  F.prototype.attributes = function(){ return this.relationOne.attributes().concat(this.relationTwo.attributes()) }
  
  F.prototype._predicateIsDefault = function() {
    return this.predicate.isSame(new knit.algebra.predicate.True())
  }
  
  F.prototype.appendToPredicate = function(additionalPredicate) {
    if (this._predicateIsDefault()) {
      this.predicate = additionalPredicate
    } else {
      this.predicate = new knit.algebra.predicate.Conjunction(this.predicate, additionalPredicate)
    }
    return this
  }

  F.prototype.isSame = function(other) {
    return other.constructor == F && 
           this.relationOne.isSame(other.relationOne) &&
           this.relationTwo.isSame(other.relationTwo) &&
           this.predicate.isSame(other.predicate)
  }
 
  F.prototype.isEquivalent = function(other) {
    return this.isSame(other) ||
             other.constructor == F && 

             ((this.relationOne.isSame(other.relationOne) &&
              this.relationTwo.isSame(other.relationTwo)) ||

             (this.relationOne.isSame(other.relationTwo) &&
              this.relationTwo.isSame(other.relationOne))) &&

             this.predicate.isEquivalent(other.predicate)
  }
  
  F.prototype.split = function(){return this}
  F.prototype.merge = function(){return this}
  
  F.prototype.inspect = function(){
    var inspectStr = "join(" + this.relationOne.inspect() + "," + this.relationTwo.inspect()
  
    if (!this._predicateIsDefault()) {
      inspectStr += "," + this.predicate.inspect()
    }
  
    inspectStr += ")"
    return inspectStr
  }

  return F
}()

knit.dslLocals.join = function(relationOne, relationTwo, predicate) { 
  return new knit.algebra.Join(relationOne, relationTwo, predicate) 
}