require("knit/core")
require("knit/algebra/predicate")

knit.algebra.Select = (function() {
  
  var _ = knit._util,
      C = function(relation, predicate) {
        this.relation = relation
        this.predicate = predicate
      }, 
      p = C.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.defaultCompiler = function() { return this.relation.defaultCompiler() }

  p.attributes = function(){ return this.relation.attributes() }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }
  
  p.merge = function() {
    if (this.relation.predicate) {
      return new C(this.relation.relation.merge(), new knit.algebra.predicate.Conjunction(this.relation.predicate, this.predicate))
    } else {
      return this
    }
  }
  
  p.split = function() {
    if (this.predicate.constructor == knit.algebra.predicate.Conjunction) {
        return new C(
          new C(this.relation.split(), this.predicate.leftPredicate),
          this.predicate.rightPredicate
        )
    } else {
      return this
    }
  }
  
  p._doPush = function(relation) { return new C(relation, this.predicate).push() }
  
  p.push = function() {
    if (_.quacksLike(this.relation, knit.signature.join)) {
      var join = this.relation
      if (this.predicate.concernedWithNoOtherRelationsBesides(join.relationOne)) {
        join.relationOne = this._doPush(join.relationOne)
        return join
      } else if (this.predicate.concernedWithNoOtherRelationsBesides(join.relationTwo)) {
        join.relationTwo = this._doPush(join.relationTwo)
        return join
      } else if (this.predicate.concernedWithNoOtherRelationsBesides(join.relationOne, join.relationTwo) &&
                 this.predicate.concernedWithAllOf(join.relationOne, join.relationTwo)) {
        join.appendToPredicate(this.predicate)
        return join
      } else {
        return this
      }
    } else if (this.relation.push) {
      var innerPushResult = this.relation.push()
      if (innerPushResult===this.relation) { //bounce
        // me(
        //   you(
        //     yourRelation,
        //    [yourStuff]
        //   ),
        //  [myStuff]
        // )
        
        //becomes
        
        // you(
        //   me(
        //     yourRelation,
        //    [yourStuff]
        //   ),
        //  [myStuff]
        // )
        
        var me = this
        
        var you = this.relation
        var yourRelation = this.relation.relation
        
        me.relation = yourRelation
        you.relation = me.push()
        
        return you
      } else {
        this.relation = innerPushResult
        return this.push()
      }
    } else {
      return this
    }
  }
  
  p.isSame = function(other) {
    return other.constructor == C && 
           this.relation.isSame(other.relation) &&
           this.predicate.isSame(other.predicate)
  }
  
  p.isEquivalent = function(other) {
    if (other.constructor == C) {
      var thisMerged = this.merge()
      var otherMerged = other.merge()
    
      return thisMerged.isSame(otherMerged) ||
               thisMerged.relation.isEquivalent(otherMerged.relation) &&
               thisMerged.predicate.isEquivalent(otherMerged.predicate)
    } else {
      return false
    }
  }
  
  p.inspect = function(){return "select(" + this.relation.inspect() + "," + 
                                            this.predicate.inspect() + ")"}
  
  return C
})()

knit.createBuilderFunction.dslLocals.select = function(relation, predicate) {
  return new knit.algebra.Select(relation, predicate)
}
