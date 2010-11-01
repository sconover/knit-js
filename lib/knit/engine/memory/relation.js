knit.engine.Memory.Relation = function(name, attributeNames, tuples, costSoFar) {
	this.name = name
	var self = this
	this.attributes = _.map(attributeNames, function(attr){
		return attr.name ? attr : new knit.engine.Memory.Attribute(attr, self)
	})
	
	this._tuples = tuples || []	
	this.cost = costSoFar || 0
}

_.extend(knit.engine.Memory.Relation.prototype, {
	attr: function(attributeName) {
    return _.detect(this.attributes, function(attr){return attr.name == attributeName})
  },
	
  isSame: function(other) {
	  return this === other
  },

  inspect: function() {
    return this.name + "[" + 
           _.map(this.attributes, function(attr){return attr.inspect()}).join(",") + 
           "]" 
  },

	tuplesSync: function() {
		return [].concat(this._tuples)
	},
	
	apply: function() {
		return this
	},
	
	_tuplesWithAttributes: function() {
		var self = this
		return _.map(this._tuples, function(tuple){
			var tupleWithAttributes = []
			for (var i=0; i<self.attributes.length; i++) {
				tupleWithAttributes.push([self.attributes[i], tuple[i]])
			}
			return tupleWithAttributes
		})
	},
	
	applySelect: function(criteria) {
		
		var matchingAttributesToTuples = 
		  _.select(this._tuplesWithAttributes(), function(tupleWithAttributes){return criteria.match(tupleWithAttributes)})
		
		var matchingTuples = 
			_.map(matchingAttributesToTuples, 
						function(attributeToValueTuple){
							return _.map(attributeToValueTuple, function(attributeToValue){return attributeToValue[1]})
						})

	  return this._newRelation(matchingTuples) 
  },

	applyJoin: function(relationTwo) {
		var tuples = this.tuplesSync()
		var otherTuples = relationTwo.tuplesSync()
		var joinTuples = []
		
		_.each(tuples, function(tuple){
			_.each(otherTuples, function(otherTuple){
				joinTuples.push([].concat(tuple).concat(otherTuple))
			})
		})

	  return this._newRelation(joinTuples) 
  },

  _newRelation: function(tuples) {
	  return new knit.engine.Memory.Relation(this.name, this.attributes, tuples, this.cost + tuples.length) 
  }
})

knit.engine.Memory.Relation.prototype.isEquivalent = knit.engine.Memory.Relation.prototype.isSame


knit.engine.Memory.MutableRelation = function(name, attributeNames) {
	return knit.createObject(new knit.engine.Memory.Relation(name, attributeNames), {
		insertSync: function(tuplesToAdd) {
			var self = this
			_.each(tuplesToAdd, function(tuple){self._tuples.push(tuple)})
			return this
		}
	})
}