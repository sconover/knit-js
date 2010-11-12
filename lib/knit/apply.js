require("knit/algebra")

_.extend(knit.algebra.Select.prototype, {
  apply: function() {
    return this.relation.apply().applySelect(this.criteria)
  }
})

_.extend(knit.algebra.Join.prototype, {
  apply: function() {
    var joinedRelation = this.relationOne.apply().applyJoin(this.relationTwo.apply(), this.predicate)
    joinedRelation._attributes = this._attributes
    return joinedRelation
  }
})
