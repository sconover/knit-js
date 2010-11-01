require("knit/algebra")

_.extend(knit.algebra.Select.prototype, {
	apply: function() {
		return this.relation.applySelect(this.criteria)
	}
})