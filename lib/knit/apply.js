require("knit/algebra")

_.extend(knit.algebra.Select.prototype, {
	apply: function() {
		return this.relation.apply().applySelect(this.criteria)
	}
})

_.extend(knit.algebra.Join.prototype, {
	apply: function() {
		var joinedRelation = this.relationOne.apply().applyJoin(this.relationTwo.apply())
		joinedRelation.name = joinedRelation.name + "__" + this.relationTwo.name
		joinedRelation.attributes = this.attributes
		return joinedRelation
	}
})