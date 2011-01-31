knit.engine.Memory.Relation = function() {
  
  var _id = 0
  
  var F = function(name, attributeNames, primaryKey, rows, costSoFar) {
    _id += 1
    this._id = "memory_" + _id + "_" + name
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
      self.nameToAttribute[attrToAdd.name()] = attrToAdd
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
  }; var p = F.prototype

  p.id = function(){ return this._id }
  p.name = function(){ return this._name }
  p.attributes = function(){ return this._attributes }
  
  p.attr = function() {
    var args = _.toArray(arguments)
    if (args.length == 0) {
      return null
    } else if (args.length == 1) {
      return this.nameToAttribute[args[0]]
    } else {
      var self = this
      return _.map(args, function(attributeName){return self.nameToAttribute[attributeName]})
    }
  }
  p.split = function(){return this}
  p.merge = function(){return this}
  
  p.isSame = function(other) {
    return other.id && this.id() == other.id()
  }
  
  p.isEquivalent = function(other) {
    return knit.quacksLike(other, knit.signature.relation) &&
           this.attributes().length == other.attributes().length &&
           _.detect(this.attributes(), function(attr, i){return !attr.isSame(other.attributes()[i])}) == null
  }
  
  
  p.inspect = function() {
    return this.name() + "[" + 
           _.map(this.attributes(), function(attr){return attr.inspect()}).join(",") + 
           "]" 
  }

  p.rows = function() {
    return this._rowStore.rows()
  }
  
  p.objects = function(rows) {
    rows = rows || this.rows()
    var self = this
    return _.map(rows, function(row){
      var object = {}
      _.each(row, function(value, columnPosition){
        var attr = self._attributes[columnPosition]
        var propertyName = attr.name()
        if (attr.nestedRelation) {
          object[propertyName] = attr.nestedRelation().objects(value)
        } else {
          object[propertyName] = value
        }
      })
      return object
    })
  }
  
  p.perform = function() {
    return this
  }
  
  function rowWithAttributes(row, attributes) {
    var rowWithAttributes = []
    for (var i=0; i<attributes.length; i++) {
      rowWithAttributes.push([attributes[i], row[i]])
    }
    return rowWithAttributes
  }
  
  p._rowsWithAttributes = function() {
    var self = this
    return _.map(this._rowStore.rows(), function(row){
      return rowWithAttributes(row, self.attributes())
    })
  }
  
  p.performSelect = function(criteria) {
    
    var matchingAttributesToRows = 
      _.select(this._rowsWithAttributes(), function(rowWithAttributes){return criteria.match(rowWithAttributes)})
    
    var matchingRows = 
      _.map(matchingAttributesToRows, 
            function(attributeToValueRow){
              return _.map(attributeToValueRow, function(attributeToValue){return attributeToValue[1]})
            })

    return this._newRelation(matchingRows) 
  }
  
  p.performProject = function(attributes) {
    var self = this
    var positionsToKeep = _.map(attributes, function(attr){return knit.indexOfSame(self.attributes(), attr)})
    var projectedRows = _.map(this.rows(), function(row) {
      return _.map(positionsToKeep, function(position) {
        return row[position]
      })
    })
    return this._newRelation(projectedRows, this.name(), attributes) 
  }

  function joinRows(combinedAttributes, outerRows, innerRows, predicate, candidateJoinRowFunction, 
                    innerAttributes, noInnerMatchFoundFunction) {
    var resultRows = []
    
    _.each(outerRows, function(outerRow){
      var innerRowMatchFound = false
      _.each(innerRows, function(innerRow){
        var candidateJoinRow = candidateJoinRowFunction(outerRow, innerRow) 
        if (predicate.match(rowWithAttributes(candidateJoinRow, combinedAttributes))) {
          resultRows.push(candidateJoinRow)
          innerRowMatchFound = true
        }
      })
      
      if ( noInnerMatchFoundFunction && ! innerRowMatchFound) {
        noInnerMatchFoundFunction(innerAttributes, outerRow, resultRows)
      }
    })

    return resultRows
  }


  p.performJoin = function(relationTwo, predicate) {
    var combinedAttributes = [].concat(this.attributes()).concat(relationTwo.attributes())           
    return this._newRelation(
      joinRows(
        combinedAttributes,
        this.rows(),
        relationTwo.rows(),
        predicate,
        function(leftRow, rightRow){return [].concat(leftRow).concat(rightRow)}
      ), 
      this.name() + "__" + relationTwo.name(), 
      combinedAttributes)
  }

  p.performLeftOuterJoin = function(relationTwo, predicate) {
    var combinedAttributes = [].concat(this.attributes()).concat(relationTwo.attributes())           
    return this._newRelation(
      joinRows(
        combinedAttributes,
        this.rows(),
        relationTwo.rows(),
        predicate,
        function(leftRow, rightRow){return [].concat(leftRow).concat(rightRow)},
        relationTwo.attributes(),
        function(rightAttributes, leftRow, joinRows){
          var rightAsNulls = []
          _.times(rightAttributes.length, function(){rightAsNulls.push(null)})
          var leftRowWithNullRightValues = [].concat(leftRow).concat(rightAsNulls)
          joinRows.push(leftRowWithNullRightValues)
        }
      ), 
      this.name() + "__" + relationTwo.name(), 
      combinedAttributes)
  }

  p.performRightOuterJoin = function(relationTwo, predicate) {
    var combinedAttributes = [].concat(this.attributes()).concat(relationTwo.attributes())           
    return this._newRelation(
      joinRows(
        combinedAttributes,
        relationTwo.rows(),
        this.rows(),
        predicate,
        function(rightRow, leftRow){return [].concat(leftRow).concat(rightRow)},
        this.attributes(),
        function(leftAttributes, rightRow, joinRows){
          var leftAsNulls = []
          _.times(leftAttributes.length, function(){leftAsNulls.push(null)})
          var rightRowWithNullLeftValues = [].concat(leftAsNulls).concat(rightRow)
          joinRows.push(rightRowWithNullLeftValues)
        }
      ), 
      this.name() + "__" + relationTwo.name(), 
      combinedAttributes)
  }

  p.performOrder = function(orderAttribute, direction) {
    var columnNumber = knit.indexOfSame(this.attributes(), orderAttribute)
    var sortedRows = _.sortBy(this.rows(), function(row){ return row[columnNumber] });
    if (direction == knit.algebra.Order.DESC) sortedRows.reverse()
    return this._newRelation(sortedRows) 
  }

  p.performUnnest = function(nestedAttribute) {
    var newAttributes = [].concat(this.attributes())
    var nestedAttributeIndex = knit.indexOfSame(newAttributes, nestedAttribute)
    newAttributes.splice.apply(newAttributes, [nestedAttributeIndex,1].concat(nestedAttribute.nestedRelation().attributes()))
    
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
  }
  
  p.performNest = function(nestedAttribute, newAttributeArrangement) {
    //assumption: this relation is ordered by all non-nested attributes.  
    //note that for now this is guaranteed by nest.perform.
    var self = this

    var oldNestedPositions = []
    _.each(nestedAttribute.nestedRelation().attributes(), function(nestedAttr) {
      var oldNestedPosition = knit.indexOfSame(self.attributes(), nestedAttr)
      oldNestedPositions.push(oldNestedPosition)
    })

    var newFlatAttrPositionToOldFlatAttrPosition = {}
    var oldFlatPositions = []
    _.each(newAttributeArrangement, function(newAttr, newPosition){
      if (!newAttr.isSame(nestedAttribute)) {
        var oldFlatPosition = knit.indexOfSame(self.attributes(), newAttr)
        oldFlatPositions.push(oldFlatPosition)
        newFlatAttrPositionToOldFlatAttrPosition[newPosition] = oldFlatPosition
      }
    })
    
    var nestedAttributePosition = knit.indexOfSame(newAttributeArrangement, nestedAttribute)
    
    var newRows = []
    
    var currentNewRow = null
    var currentFlatValues = null
    _.each(this.rows(), function(row) {
      var flatValuesForThisRow = _.map(oldFlatPositions, function(flatPosition){return row[flatPosition]})
      var nestedValuesForThisRow = _.map(oldNestedPositions, function(nestedPosition){return row[nestedPosition]})
      var allValuesAreNull = _.without(nestedValuesForThisRow, null).length==0
      
      if (_.isEqual(flatValuesForThisRow, currentFlatValues)) {
        if ( ! allValuesAreNull) currentNewRow[nestedAttributePosition].push(nestedValuesForThisRow)
      } else {
        if (currentNewRow) {
          newRows.push(currentNewRow)
        }
        
        currentNewRow = _.map(newAttributeArrangement, function(attr, newPos){
          if (attr.isSame(nestedAttribute)) {
            return allValuesAreNull ? [] : [nestedValuesForThisRow]
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
  }

  p.newNestedAttribute = function(attributeName, attributesToNest) {
    var nestedRelation = new knit.engine.Memory.Relation("(nested)", attributesToNest, [], [], 0) 
    return new knit.engine.Memory.NestedAttribute(attributeName, nestedRelation, this)
  }

  p._newRelation = function(rows, name, attributes) {
    var newName = name || this.name()
    var newAttributes = attributes || this.attributes()
    
    //curry?
    return new knit.engine.Memory.Relation(newName, newAttributes, this._pkAttributeNames, rows, this.cost + rows.length) 
  }
  
  return F
}()

knit.engine.Memory.MutableRelation = function(name, attributeNames, primaryKey) {
  var result = new knit.engine.Memory.Relation(name, attributeNames, primaryKey)
  _.extend(result, {
    merge: function(rowsToAdd) {
      this._rowStore.merge(rowsToAdd)
      return this
    }
  })
  return result
}
