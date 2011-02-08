knit.engine.Memory.Relation = function() {
  
  var _A = CollectionFunctions.Array.functions,
      _ = knit._util
  
  var _id = 0
  
  var F = function(name, attributeNames, primaryKey, rows, costSoFar) {
    _id += 1
    this._id = "memory_" + _id + "_" + name
    this._name = name
    var self = this
    
    if (attributeNames.constructor == knit.Attributes) {
      this._attributes = attributeNames //confusingly enough...
    } else {
      var attributes = []
      var self = this
      _A.each(attributeNames, function(attr){
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
    
        attributes.push(attrToAdd)
      })      
      this._attributes = new knit.Attributes(attributes)
    }
    
    this._pkAttributeNames = primaryKey || []
    var pkPositions = _A.indexesOf(this._attributes.names(), this._pkAttributeNames)

    this._rowStore = new knit.engine.Memory.StandardRowStore(pkPositions, rows || [])
    this.cost = costSoFar || 0
  }; var p = F.prototype

  p.id = function(){ return this._id }
  p.name = function(){ return this._name }
  p.attributes = function(){ return this._attributes }
  p.attr = function() { return this.attributes().get(_A.toArray(arguments)) }
  p.split = function(){return this}
  p.merge = function(){return this}
  p.perform = function() { return this }
  p.rows = function() { return this._rowStore.rows() }
  p.objects = function(rows) {
    rows = rows || this.rows()
    var attributes = this.attributes()
    return _A.map(rows, function(row){return attributes.makeObjectFromRow(row)})
  }
  
  p.isSame = function(other) { return other.id && this.id() == other.id() }
  p.isEquivalent = function(other) {
    return knit.quacksLike(other, knit.signature.relation) &&
           this.attributes().isEquivalent(other.attributes())
  }
  
  p.inspect = function() { return this.name() + "[" + this.attributes().inspect() + "]" }
  
  
  p._newRelation = function(rows, name, attributes) {
    var newName = name || this.name()
    var newAttributes = attributes || this.attributes()
    
    //curry?
    return new knit.engine.Memory.Relation(newName, newAttributes, this._pkAttributeNames, rows, this.cost + rows.length) 
  }
  
  p.newNestedAttribute = function(attributeName, attributesToNest) {
    var nestedRelation = new knit.engine.Memory.Relation("(nested)", attributesToNest, [], [], 0) 
    return new knit.engine.Memory.NestedAttribute(attributeName, nestedRelation, this)
  }

  
  
  
  p.performSelect = function(predicate) {
    var attributes = this.attributes()
    var matchingRows = _A.select(this.rows(), function(row){return predicate.match(attributes, row)})        
    return this._newRelation(matchingRows) 
  }
  
  p.performProject = function(keepAttributes) {
    var positionsToKeep = this.attributes().indexesOf(keepAttributes)
    var projectedRows = _A.map(this.rows(), function(row) {
      return _A.map(positionsToKeep, function(position) {
        return row[position]
      })
    })
    return this._newRelation(projectedRows, this.name(), keepAttributes) 
  }

  function joinRows(combinedAttributes, outerRows, innerRows, predicate, candidateJoinRowFunction, 
                    innerAttributes, noInnerMatchFoundFunction) {
    var resultRows = []
    
    _A.each(outerRows, function(outerRow){
      var innerRowMatchFound = false
      _A.each(innerRows, function(innerRow){
        var candidateJoinRow = candidateJoinRowFunction(outerRow, innerRow) 
        if (predicate.match(combinedAttributes, candidateJoinRow)) {
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
    var combinedAttributes = this.attributes().concat(relationTwo.attributes())           
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
    var combinedAttributes = this.attributes().concat(relationTwo.attributes())           
    return this._newRelation(
      joinRows(
        combinedAttributes,
        this.rows(),
        relationTwo.rows(),
        predicate,
        function(leftRow, rightRow){return [].concat(leftRow).concat(rightRow)},
        relationTwo.attributes(),
        function(rightAttributes, leftRow, joinRows){
          var rightAsNulls = _A.repeat([null], rightAttributes.size())
          var leftRowWithNullRightValues = [].concat(leftRow).concat(rightAsNulls)
          joinRows.push(leftRowWithNullRightValues)
        }
      ), 
      this.name() + "__" + relationTwo.name(), 
      combinedAttributes)
  }

  p.performRightOuterJoin = function(relationTwo, predicate) {
    var combinedAttributes = this.attributes().concat(relationTwo.attributes())           
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
          var leftAsNulls = _A.repeat([null], leftAttributes.size())
          var rightRowWithNullLeftValues = [].concat(leftAsNulls).concat(rightRow)
          joinRows.push(rightRowWithNullLeftValues)
        }
      ), 
      this.name() + "__" + relationTwo.name(), 
      combinedAttributes)
  }
  
  function divideRows(dividendAttributes, dividendRows, divisorAttributes, divisorRows, quotientAttributes) {
    function qualifyingDividendRows(dividendRows, dividendAttributes, divisorAttributes) {
      var divisorPositionsInDividend = dividendAttributes.indexesOf(divisorAttributes)
      //efficiency later
      return _A.select(dividendRows, function(dividendRow) {
        var divisorCandidate = _A.get(dividendRow, divisorPositionsInDividend)
        return _A.detect(divisorRows, function(divisorRow){return _A.equals(divisorRow, divisorCandidate)})
      })
    }
    
    var quotientPositionsInDividend = dividendAttributes.indexesOf(quotientAttributes)
    var qualifyingDividendRows = qualifyingDividendRows(dividendRows, dividendAttributes, divisorAttributes)
    var quotientRows = []
    var currentQuotientRow = null
    _A.each(qualifyingDividendRows, function(dividendRow){
      var candidateQuotientRow = _A.get(dividendRow, quotientPositionsInDividend)
      if (currentQuotientRow==null || !_A.equals(candidateQuotientRow, currentQuotientRow)) {
        quotientRows.push(candidateQuotientRow)
        currentQuotientRow = candidateQuotientRow
      }
    })
    return quotientRows
  }
  
  p.performDivide = function(divisor, quotientAttributes) {
    var quotientName = this.name() + "$$" + divisor.name()
    var quotientRows = divideRows(this.attributes(), this.rows(), 
                                  divisor.attributes(), divisor.rows(),
                                  quotientAttributes)
    return this._newRelation(quotientRows, quotientName, quotientAttributes)
  }

  p.performOrder = function(orderAttribute, direction) {
    var columnNumber = this.attributes().indexOf(orderAttribute)
    var sortedRows = _A.sortBy(this.rows(), function(row){ return row[columnNumber] });
    if (direction == knit.algebra.Order.DESC) sortedRows.reverse()
    return this._newRelation(sortedRows) 
  }

  p.performUnnest = function(nestedAttribute) {
    var nestedAttributeIndex = this.attributes().indexOf(nestedAttribute)
    var newAttributes = this.attributes().splice(nestedAttribute.nestedRelation().attributes(), nestedAttributeIndex, 1)

    var unnestedRows = []

    _A.each(this.rows(), function(row) {
      var nestedRows = row[nestedAttributeIndex]
      _A.each(nestedRows, function(nestedRow){
        unnestedRows.push(_A.splice(row, nestedRow, nestedAttributeIndex, 1))
      })
    })
    return this._newRelation(unnestedRows, this.name(), newAttributes) 
  }
  
  p.performNest = function(nestedAttribute, newAttributeArrangement) {
    //assumption: this relation is ordered by all non-nested attributes.  
    //note that for now this is guaranteed by nest.perform.
    var self = this
    
    var oldNestedPositions = this.attributes().indexesOf(nestedAttribute.nestedRelation().attributes())
    var oldFlatPositions = this.attributes().indexesOf(newAttributeArrangement.without(nestedAttribute))
  
    var newFlatAttrPositionToOldFlatAttrPosition = {}
    newAttributeArrangement.each(function(newAttr, newPosition){
      if (!newAttr.isSame(nestedAttribute)) {
        var oldFlatPosition = self.attributes().indexOf(newAttr)
        newFlatAttrPositionToOldFlatAttrPosition[newPosition] = oldFlatPosition
      }
    })
    
    var nestedAttributePosition = newAttributeArrangement.indexOf(nestedAttribute)

    var newRows = []
    
    var currentNewRow = null
    var currentFlatValues = null
    _A.each(this.rows(), function(row) {
      var flatValuesForThisRow = _A.get(row, oldFlatPositions)
      var nestedValuesForThisRow = _A.get(row, oldNestedPositions)
      var allValuesAreNull = !(_A.detect(nestedValuesForThisRow, function(value){return value != null}))
      
      if (currentFlatValues!=null && _A.equals(flatValuesForThisRow, currentFlatValues)) {
        if ( ! allValuesAreNull) currentNewRow[nestedAttributePosition].push(nestedValuesForThisRow)
      } else {
        if (currentNewRow) newRows.push(currentNewRow)
        
        currentNewRow = newAttributeArrangement.map(function(attr, newPos){
          if (newPos == nestedAttributePosition) {
            return allValuesAreNull ? [] : [nestedValuesForThisRow]
          } else {
            var oldPos = newFlatAttrPositionToOldFlatAttrPosition[newPos]
            return row[oldPos]
          }
        })
        
        currentFlatValues = flatValuesForThisRow
      }
    })
    
    if (currentNewRow) newRows.push(currentNewRow)
    
    return this._newRelation(newRows, this.name(), newAttributeArrangement) 
  }

  return F
}()

knit.engine.Memory.MutableRelation = function(name, attributeNames, primaryKey) {
  var result = new knit.engine.Memory.Relation(name, attributeNames, primaryKey)
  knit._util.extend(result, {
    merge: function(rowsToAdd) {
      this._rowStore.merge(rowsToAdd)
      return this
    }
  })
  return result
}
