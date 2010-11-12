knit.engine.Memory.Relation = function(name, attributeNames, tuples, costSoFar) {
  this.name = name
  var self = this
  this._attributes = _.map(attributeNames, function(attr){
    return attr.name ? attr : new knit.engine.Memory.Attribute(attr, self)
  })
  
  this._tuples = tuples || []  
  this.cost = costSoFar || 0
}

_.extend(knit.engine.Memory.Relation.prototype, {
  attributes: function(){ return this._attributes },
  
  attr: function(attributeName) {
    return _.detect(this.attributes(), function(attr){return attr.name == attributeName})
  },
  
  isSame: function(other) {
    return this === other
  },

  inspect: function() {
    return this.name + "[" + 
           _.map(this.attributes(), function(attr){return attr.inspect()}).join(",") + 
           "]" 
  },

  tuplesSync: function() {
    return [].concat(this._tuples)
  },
  
  apply: function() {
    return this
  },
  
  _tupleWithAttributes: function(tuple, attributes) {
    var tupleWithAttributes = []
    for (var i=0; i<attributes.length; i++) {
      tupleWithAttributes.push([attributes[i], tuple[i]])
    }
    return tupleWithAttributes
  },
  
  _tuplesWithAttributes: function() {
    var self = this
    return _.map(this._tuples, function(tuple){
      return self._tupleWithAttributes(tuple, self.attributes())
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

  applyJoin: function(relationTwo, predicate) {
    var tuples = this.tuplesSync()
    var otherTuples = relationTwo.tuplesSync()
    var combinedAttributes = [].concat(this.attributes()).concat(relationTwo.attributes())
    var joinTuples = []
    var self = this
    
    _.each(tuples, function(tuple){
      _.each(otherTuples, function(otherTuple){
        var candidateJoinTuple = [].concat(tuple).concat(otherTuple)
        if (predicate.match(self._tupleWithAttributes(candidateJoinTuple, combinedAttributes))) {
          joinTuples.push(candidateJoinTuple)
        }
      })
    })

    return this._newRelation(joinTuples, this.name + "__" + relationTwo.name) 
  },

  _newRelation: function(tuples, name) {
    var newName = name || this.name
    return new knit.engine.Memory.Relation(newName, this.attributes(), tuples, this.cost + tuples.length) 
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
