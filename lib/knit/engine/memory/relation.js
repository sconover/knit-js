knit.engine.Memory.Relation = function(name, attributeNames, primaryKey, rows, costSoFar) {
  this._name = name
  var self = this
  this._attributes = _.map(attributeNames, function(attr){
    return attr.name ? attr : new knit.engine.Memory.Attribute(attr, self)
  })
  
  this._pkAttributeNames = primaryKey || []
  var pkPositions = 
    _.map(this._pkAttributeNames, function(pkAttributeName){
      var position = -1
      _.each(attributeNames, function(attributeName, i){
        if (pkAttributeName == attributeName) {
          position = i
        }
      })
      return position
    })
  
  this._rowStore = new knit.engine.Memory.StandardTupleStore(pkPositions, rows || [])
  this.cost = costSoFar || 0
}

_.extend(knit.engine.Memory.Relation.prototype, {
  name: function(){ return this._name },
  attributes: function(){ return this._attributes },
  
  attr: function(attributeName) {
    return _.detect(this.attributes(), function(attr){return attr.name == attributeName})
  },
  
  isSame: function(other) {
    return this === other
  },

  inspect: function() {
    return this.name() + "[" + 
           _.map(this.attributes(), function(attr){return attr.inspect()}).join(",") + 
           "]" 
  },

  rows: function() {
    return this._rowStore.rows()
  },
  
  objects: function() {
    var self = this
    return _.map(this._rowStore.rows(), function(row){
      var object = {}
      _.each(row, function(value, columnPosition){
        var propertyName = self._attributes[columnPosition].name
        object[propertyName] = value
      })
      return object
    })
  },
  
  apply: function() {
    return this
  },
  
  _rowWithAttributes: function(row, attributes) {
    var rowWithAttributes = []
    for (var i=0; i<attributes.length; i++) {
      rowWithAttributes.push([attributes[i], row[i]])
    }
    return rowWithAttributes
  },
  
  _rowsWithAttributes: function() {
    var self = this
    return _.map(this._rowStore.rows(), function(row){
      return self._rowWithAttributes(row, self.attributes())
    })
  },
  
  applySelect: function(criteria) {
    
    var matchingAttributesToRows = 
      _.select(this._rowsWithAttributes(), function(rowWithAttributes){return criteria.match(rowWithAttributes)})
    
    var matchingRows = 
      _.map(matchingAttributesToRows, 
            function(attributeToValueRow){
              return _.map(attributeToValueRow, function(attributeToValue){return attributeToValue[1]})
            })

    return this._newRelation(matchingRows) 
  },

  applyJoin: function(relationTwo, predicate) {
    var rows = this.rows()
    var otherRows = relationTwo.rows()
    var combinedAttributes = [].concat(this.attributes()).concat(relationTwo.attributes())
    var joinRows = []
    var self = this
    
    _.each(rows, function(row){
      _.each(otherRows, function(otherRow){
        var candidateJoinRow = [].concat(row).concat(otherRow)
        if (predicate.match(self._rowWithAttributes(candidateJoinRow, combinedAttributes))) {
          joinRows.push(candidateJoinRow)
        }
      })
    })

    return this._newRelation(joinRows, this.name() + "__" + relationTwo.name()) 
  },

  applyOrder: function(orderAttribute, direction) {
    var columnNumber = _.indexOf(this.attributes(), orderAttribute)
    var sortedRows = _.sortBy(this.rows(), function(row){ return row[columnNumber] });
    if (direction == knit.algebra.Order.DESC) {
      sortedRows.reverse()
    }
    return this._newRelation(sortedRows) 
  },

  _newRelation: function(rows, name) {
    var newName = name || this.name()
    
    //curry?
    return new knit.engine.Memory.Relation(newName, this.attributes(), this._pkAttributeNames, rows, this.cost + rows.length) 
  }
})

knit.engine.Memory.Relation.prototype.isEquivalent = knit.engine.Memory.Relation.prototype.isSame


knit.engine.Memory.MutableRelation = function(name, attributeNames, primaryKey) {
  return knit.createObject(new knit.engine.Memory.Relation(name, attributeNames, primaryKey), {
    merge: function(rowsToAdd) {
      this._rowStore.merge(rowsToAdd)
      return this
    }
  })
}
