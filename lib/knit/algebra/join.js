require("knit/core")
require("knit/algebra/predicate")

knit.algebra.Join = function(){

  var F = function(relationOne, relationTwo, predicate) {
    this.relationOne = relationOne
    this.relationTwo = relationTwo
    this.predicate = predicate || new knit.algebra.predicate.True()
  }; var p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.operationName = function(){return "join"}
  
  p.newNestedAttribute = function() {    
    return this.relationOne.newNestedAttribute.apply(this.relationOne, arguments)
  }
  
  p.perform = function() {
    return this.relationOne.perform().performJoin(this.relationTwo.perform(), this.predicate)
  }

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
    return other.constructor == F && 
           this.relationOne.isSame(other.relationOne) &&
           this.relationTwo.isSame(other.relationTwo) &&
           this.predicate.isSame(other.predicate)
  }
 
  p.isEquivalent = function(other) {
    return this.isSame(other) ||
             other.constructor == F && 

             ((this.relationOne.isSame(other.relationOne) &&
              this.relationTwo.isSame(other.relationTwo)) ||

             (this.relationOne.isSame(other.relationTwo) &&
              this.relationTwo.isSame(other.relationOne))) &&

             this.predicate.isEquivalent(other.predicate)
  }
  
  p.split = p.merge = function(){return this}
  
  p.inspect = function(){
    var inspectStr = this.operationName() + "(" + this.relationOne.inspect() + "," + this.relationTwo.inspect()
  
    if (!this._predicateIsDefault()) {
      inspectStr += "," + this.predicate.inspect()
    }
  
    inspectStr += ")"
    return inspectStr
  }

  return F
}()

knit.createBuilderFunction.dslLocals.join = function(relationOne, relationTwo, predicate) { 
  return new knit.algebra.Join(relationOne, relationTwo, predicate) 
}


knit.algebra.LeftOuterJoin = function(relationOne, relationTwo, predicate) {
  var join = new knit.algebra.Join(relationOne, relationTwo, predicate)
  join.operationName = function(){return "leftOuterJoin"}
  join.perform = function() {
    return this.relationOne.perform().performLeftOuterJoin(this.relationTwo.perform(), this.predicate)
  }
  return join
}

knit.createBuilderFunction.dslLocals.leftOuterJoin = function(relationOne, relationTwo, predicate) { 
  return new knit.algebra.LeftOuterJoin(relationOne, relationTwo, predicate) 
}



knit.algebra.RightOuterJoin = function(relationOne, relationTwo, predicate) {
  var join = new knit.algebra.Join(relationOne, relationTwo, predicate)
  join.operationName = function(){return "rightOuterJoin"}
  join.perform = function() {
    return this.relationOne.perform().performRightOuterJoin(this.relationTwo.perform(), this.predicate)
  }
  return join
}

knit.createBuilderFunction.dslLocals.rightOuterJoin = function(relationOne, relationTwo, predicate) { 
  return new knit.algebra.RightOuterJoin(relationOne, relationTwo, predicate) 
}



knit.algebra.NaturalJoin = function(relationOne, relationTwo) {
  var _A = CollectionFunctions.Array.functions
  
  var join = new knit.algebra.Join(relationOne, relationTwo, new knit.algebra.predicate.True())

  join.perform = function() {
    var commonAttributeNames = _A.intersect(this.relationOne.attributes().names(), 
                                            this.relationTwo.attributes().names())
    var commonIdAttributeNames = _A.select(commonAttributeNames, function(attributeName){return attributeName.match(/Id$/)})

    function attributeNamesToPredicate(attributeNames, relationOne, relationTwo) {
      if (attributeNames.length == 1) {
        var attributeName = attributeNames.shift()
        return new knit.algebra.predicate.Equality(relationOne.attr(attributeName), relationTwo.attr(attributeName))
      } else if (attributeNames.length > 1) {
        var attributeOne = attributeNames.shift()
        return new knit.algebra.predicate.Conjunction(attributeNamesToPredicate([attributeOne], relationOne, relationTwo), 
                                                      attributeNamesToPredicate(attributeNames, relationOne, relationTwo))
      } else {
        return new knit.algebra.predicate.True()
      }
    }

    var predicate = attributeNamesToPredicate(commonIdAttributeNames, this.relationOne, this.relationTwo)
    
    return this.relationOne.perform().performRightOuterJoin(this.relationTwo.perform(), predicate)
  }

  return join
}

knit.createBuilderFunction.dslLocals.naturalJoin = function(relationOne, relationTwo) { 
  return new knit.algebra.NaturalJoin(relationOne, relationTwo) 
}
