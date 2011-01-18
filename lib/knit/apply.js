require("knit/algebra")

// (function(){
  //hmm this doesn't work in node, not sure why
  
  //unfortunate
  knit.algebra.rowsAndObjects = {
    rows:function(){return this.apply().rows()},
    objects:function(){return this.apply().objects()}
  }
  
  _.extend(knit.algebra.Select.prototype, _.extend({
    apply: function() {
      return this.relation.apply().applySelect(this.criteria)
    }
  }, knit.algebra.rowsAndObjects))

  _.extend(knit.algebra.Join.prototype, _.extend({
    apply: function() {
      var joinedRelation = this.relationOne.apply().applyJoin(this.relationTwo.apply(), this.predicate)
      joinedRelation._attributes = this._attributes
      return joinedRelation
    }
  }, knit.algebra.rowsAndObjects))

  _.extend(knit.algebra.Order.prototype, _.extend({
    apply: function() {
      return this.relation.apply().applyOrder(this.orderAttribute, this.direction)
    }
  }, knit.algebra.rowsAndObjects))

// })()

