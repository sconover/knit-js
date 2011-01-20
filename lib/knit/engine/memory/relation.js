knit.engine.Memory.Relation = function(name, attributeNames, primaryKey, rows, costSoFar) {
  this._name = name
  var self = this
  this.nameToAttribute = {}
  this._attributes = []
  
  var self = this
  _.each(attributeNames, function(attr){
    var attrToAdd = null
    if (attr.name) {
      attrToAdd = attr
    } else if (typeof attr == "string") {
      var attributeName = attr
      attrToAdd = new knit.engine.Memory.Attribute(attributeName, self)
    } else {
      var attributeName = _.keys(attr)[0]
      var nestedRelation = _.values(attr)[0]
      attrToAdd = new knit.engine.Memory.NestedAttribute(attributeName, nestedRelation, self)
    }
    
    self._attributes.push(attrToAdd)
    self.nameToAttribute[attrToAdd.name] = attrToAdd
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
  
  this._rowStore = new knit.engine.Memory.StandardRowStore(pkPositions, rows || [])
  this.cost = costSoFar || 0
}

_.extend(knit.engine.Memory.Relation.prototype, {
  name: function(){ return this._name },
  attributes: function(){ return this._attributes },
  
  attr: function() {
    var args = _.toArray(arguments)
    if (args.length == 0) {
      return null
    } else if (args.length == 1) {
      return this.nameToAttribute[args[0]]
    } else {
      var self = this
      return _.map(args, function(attributeName){return self.nameToAttribute[attributeName]})
    }
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
  
  objects: function(rows) {
    rows = rows || this.rows()
    var self = this
    return _.map(rows, function(row){
      var object = {}
      _.each(row, function(value, columnPosition){
        var attr = self._attributes[columnPosition]
        var propertyName = attr.name
        if (attr.nestedRelation) {
          object[propertyName] = attr.nestedRelation.objects(value)
        } else {
          object[propertyName] = value
        }
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
  
  applyProject: function(attributes) {
    var self = this
    var positionsToKeep = _.map(attributes, function(attr){return _.indexOf(self.attributes(), attr)})
    var projectedRows = _.map(this.rows(), function(row) {
      return _.map(positionsToKeep, function(position) {
        return row[position]
      })
    })
    return this._newRelation(projectedRows, this.name(), attributes) 
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
    if (direction == knit.algebra.Order.DESC) sortedRows.reverse()
    return this._newRelation(sortedRows) 
  },

  applyUnnest: function(nestedAttribute) {
    var newAttributes = [].concat(this.attributes())
    var nestedAttributeIndex = _.indexOf(newAttributes, nestedAttribute)
    newAttributes.splice.apply(newAttributes, [nestedAttributeIndex,1].concat(nestedAttribute.nestedRelation.attributes()))
    
    var unnestedRows = []

    _.each(this.rows(), function(row) {
      var nestedRows = row[nestedAttributeIndex]
      _.each(nestedRows, function(nestedRow){
        var newRow = [].concat(row)
        newRow.splice.apply(newRow, [nestedAttributeIndex,1].concat(nestedRow))
        unnestedRows.push(newRow)
      })
    })
    return this._newRelation(unnestedRows, this.name(), newAttributes) 
  },
  
  applyNest: function(nestedAttribute, newAttributeArrangement) {
    //assumption: this relation is ordered by all non-nested attributes.  
    //note that for now this is guaranteed by nest.apply.
    var self = this
    
    var oldNestedPositions = []
    _.each(nestedAttribute.nestedRelation.attributes(), function(nestedAttr) {
      var oldNestedPosition = _.indexOf(self.attributes(), nestedAttr)
      oldNestedPositions.push(oldNestedPosition)
    })

    var newFlatAttrPositionToOldFlatAttrPosition = {}
    var oldFlatPositions = []
    _.each(newAttributeArrangement, function(newAttr, newPosition){
      if (!newAttr.isSame(nestedAttribute)) {
        var oldFlatPosition = _.indexOf(self.attributes(), newAttr)
        oldFlatPositions.push(oldFlatPosition)
        newFlatAttrPositionToOldFlatAttrPosition[newPosition] = oldFlatPosition
      }
    })
    
    var nestedAttributePosition = _.indexOf(newAttributeArrangement, nestedAttribute)
    
    var newRows = []
    
    var currentNewRow = null
    var currentFlatValues = null
    _.each(this.rows(), function(row) {
      var flatValuesForThisRow = _.map(oldFlatPositions, function(flatPosition){return row[flatPosition]})
      var nestedValuesForThisRow = _.map(oldNestedPositions, function(nestedPosition){return row[nestedPosition]})

      if (_.isEqual(flatValuesForThisRow, currentFlatValues)) {
        currentNewRow[nestedAttributePosition].push(nestedValuesForThisRow)
      } else {
        if (currentNewRow) {
          newRows.push(currentNewRow)
        }
        
        currentNewRow = _.map(newAttributeArrangement, function(attr, newPos){
          if (attr.isSame(nestedAttribute)) {
            return [nestedValuesForThisRow]
          } else {
            var oldPos = newFlatAttrPositionToOldFlatAttrPosition[newPos]
            return row[oldPos]
          }
        })
        
        currentFlatValues = flatValuesForThisRow
      }
    })
    
    if (currentNewRow) {
      newRows.push(currentNewRow)
    }
    
    return this._newRelation(newRows, this.name(), newAttributeArrangement) 
  },

  newNestedAttribute: function(attributeName, attributesToNest) {
    var nestedRelation = new knit.engine.Memory.Relation("(nested)", attributesToNest, [], [], 0) 
    return new knit.engine.Memory.NestedAttribute(attributeName, nestedRelation, this)
  },

  _newRelation: function(rows, name, attributes) {
    var newName = name || this.name()
    var newAttributes = attributes || this.attributes()
    
    //curry?
    return new knit.engine.Memory.Relation(newName, newAttributes, this._pkAttributeNames, rows, this.cost + rows.length) 
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
