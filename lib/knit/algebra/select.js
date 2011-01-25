require("knit/core")
require("knit/algebra/predicate")

knit.algebra.Select = function() {
  
  var F = function(relation, criteria) {
    this.relation = relation
    this.criteria = criteria
  }
  
  knit.mixin.RowsAndObjects(F.prototype)
  
  F.prototype.perform = function() {
    return this.relation.perform().performSelect(this.criteria)
  }
  
  F.prototype.attributes = function(){ return this.relation.attributes() }
  
  F.prototype.newNestedAttribute = function() {
    this.relation.newNestedAttribute.apply(this.relation, arguments)
  }
  
  F.prototype.merge = function() {
    if (this.relation.criteria) {
      return new F(this.relation.relation.merge(), new knit.algebra.predicate.Conjunction(this.relation.criteria, this.criteria))
    } else {
      return this
    }
  }
  
  F.prototype.split = function() {
    if (this.criteria.constructor == knit.algebra.predicate.Conjunction) {
        return new F(
          new F(this.relation.split(), this.criteria.leftPredicate),
          this.criteria.rightPredicate
        )
    } else {
      return this
    }
  }
  
  F.prototype._doPush = function(relation) {
    return new F(relation, this.criteria).push()
  }
  
  F.prototype.push = function() {
    if (knit.quacksLike(this.relation, knit.signature.join)) {
      var join = this.relation
      if (this.criteria.concernedWithNoOtherRelationsBesides(join.relationOne)) {
        join.relationOne = this._doPush(join.relationOne)
        return join
      } else if (this.criteria.concernedWithNoOtherRelationsBesides(join.relationTwo)) {
        join.relationTwo = this._doPush(join.relationTwo)
        return join
      } else if (this.criteria.concernedWithNoOtherRelationsBesides(join.relationOne, join.relationTwo) &&
                 this.criteria.concernedWithAllOf(join.relationOne, join.relationTwo)) {
        join.appendToPredicate(this.criteria)
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
  
  F.prototype.isSame = function(other) {
    return other.constructor == F && 
           this.relation.isSame(other.relation) &&
           this.criteria.isSame(other.criteria)
  }
  
  F.prototype.isEquivalent = function(other) {
    if (other.constructor == F) {
      var thisMerged = this.merge()
      var otherMerged = other.merge()
    
      return thisMerged.isSame(otherMerged) ||
               thisMerged.relation.isEquivalent(otherMerged.relation) &&
               thisMerged.criteria.isEquivalent(otherMerged.criteria)
    } else {
      return false
    }
  }
  
  F.prototype.inspect = function(){return "select(" + this.relation.inspect() + "," + this.criteria.inspect() + ")"}
  
  return F
}()

knit.dslLocals.select = function(relation, criteria) {
  return new knit.algebra.Select(relation, criteria)
}
