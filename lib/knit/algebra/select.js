require("knit/core")
require("knit/algebra/predicate")

knit.algebra.Select = function(relation, criteria) {
  this.attributes = relation.attributes
  this.relation = relation
  this.criteria = criteria
}

_.extend(knit.algebra.Select.prototype, {
  merge: function() {
    if (this.relation.criteria) {
      return knit(function(){
        return select(this.relation.relation.merge(), conjunction(this.relation.criteria, this.criteria))
      }, this)
    } else {
      return this
    }
  },
  
  split: function() {
    if (this.criteria instanceof knit.algebra.predicate.Conjunction) {
      return knit(function(){
        return select(
          select(this.relation.split(), this.criteria.leftPredicate),
          this.criteria.rightPredicate
        )
      }, this)
    } else {
      return this
    }
  },
  
  _doPush: function(relation) {
    return new knit.algebra.Select(relation, this.criteria).push()
  },
  
  push: function() {
    if (this.relation instanceof knit.algebra.Join) {
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
				// 	you(
				// 		yourRelation,
				//    [yourStuff]
				// 	),
				//  [myStuff]
				// )
				
				//becomes
				
				// you(
				// 	me(
				// 		yourRelation,
				//    [yourStuff]
				// 	),
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
  },
  
  isSame: function(other) {
    return other instanceof knit.algebra.Select && 
           this.relation.isSame(other.relation) &&
           this.criteria.isSame(other.criteria)
  },
  
  isEquivalent: function(other) {
    if (other instanceof knit.algebra.Select) {
      var thisMerged = this.merge()
      var otherMerged = other.merge()
    
      return thisMerged.isSame(otherMerged) ||
               thisMerged.relation.isEquivalent(otherMerged.relation) &&
               thisMerged.criteria.isEquivalent(otherMerged.criteria)
    } else {
      return false
    }
  },
  
  inspect: function(){return "select(" + this.relation.inspect() + "," + this.criteria.inspect() + ")"}
})

knit.dslLocals.select = function(relation, criteria) {
  return new knit.algebra.Select(relation, criteria)
}