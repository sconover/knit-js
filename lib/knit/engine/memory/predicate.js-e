_.extend(knit.algebra.predicate.True.prototype, {
	match: function(attributeToValue) {
		return true
	}
})

_.extend(knit.algebra.predicate.False.prototype, {
	match: function(attributeToValue) {
		return false
	}
})

_.extend(knit.algebra.predicate.Equality.prototype, {
	_getValueForAttribute: function(attribute, attributeToValue) {
		var pair = _.detect(attributeToValue, function(pair){
			var attr = pair[0]
			var value = pair[1]
			return attr.isSame(attribute)
		})
		
		return pair ? pair[1] : null
	},
	
	_getValue: function(atom, attributeToValue) {
		return this._isAttribute(atom) ? this._getValueForAttribute(atom, attributeToValue) : atom
	},
	
	match: function(attributeToValue) {
		var left = this._getValue(this.leftAtom, attributeToValue)
		var right = this._getValue(this.rightAtom, attributeToValue)
		return left == right
	}
})

_.extend(knit.algebra.predicate.Conjunction.prototype, {
	match: function(attributeToValue) {
		return this.leftPredicate.match(attributeToValue) && this.rightPredicate.match(attributeToValue)
	}	
})