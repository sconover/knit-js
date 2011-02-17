knit.engine.memory.Relation = function() {
  var _ = knit._util,
      _id = 0,
      F = function(name, attributeNamesAndTypes, primaryKey, rows, costSoFar) {
            _id += 1
            this._id = "memory_" + _id + "_" + name
            this._name = name
            var self = this

            if (attributeNamesAndTypes.constructor == knit.Attributes) {
              this._attributes = attributeNamesAndTypes //confusingly enough...
            } else {
              var attributes = [],
                  self = this
              _.each(attributeNamesAndTypes, function(nameAndType){
                var attrToAdd = null
                if (nameAndType.name) {
                  attrToAdd = nameAndType
                } else if (nameAndType.push) {
                  var attributeName = nameAndType[0],
                      attributeType = nameAndType[1]
                  attrToAdd = new knit.engine.memory.Attribute(attributeName, attributeType, self)
                } else {
                  var attributeName = _.keys(nameAndType)[0],
                      nestedRelation = _.values(nameAndType)[0]
                  attrToAdd = new knit.engine.memory.NestedAttribute(attributeName, nestedRelation, self)
                }

                attributes.push(attrToAdd)
              })      
              this._attributes = new knit.Attributes(attributes)
            }

            this._pkAttributeNames = primaryKey || []
            var pkPositions = _.indexesOf(this._attributes.names(), this._pkAttributeNames)

            this._rowStore = new knit.engine.memory.StandardRowStore(pkPositions, rows || [])
            this.cost = costSoFar || 0
          },
      p = F.prototype

  p.id = function(){ return this._id }
  p.name = function(){ return this._name }
  p.attributes = function(){ return this._attributes }
  p.attr = function() { return this.attributes().get(_.toArray(arguments)) }
  p.split = 
    p.merge = 
      p.perform = function(){return this}
  p.rows = function() { return this._rowStore.rows() }
  p.objects = function(rows) {
    rows = rows || this.rows()
    var attributes = this.attributes()
    return _.map(rows, function(row){return attributes.makeObjectFromRow(row)})
  }
  
  p.isSame = function(other) { return other.id && this.id() == other.id() }
  p.isEquivalent = function(other) {
    return knit.quacksLike(other, knit.signature.relation) &&
           this.attributes().isEquivalent(other.attributes())
  }
  
  p.inspect = function() { return this.name() + "[" + this.attributes().inspect() + "]" }
  
  
  p._newRelation = function(rows, name, attributes) {
    var newName = name || this.name(),
        newAttributes = attributes || this.attributes()
    
    //curry?
    return new knit.engine.memory.Relation(newName, newAttributes, this._pkAttributeNames, rows, this.cost + rows.length) 
  }
  
  p.newNestedAttribute = function(attributeName, attributesToNest) {
    var nestedRelation = new knit.engine.memory.Relation("(nested)", attributesToNest, [], [], 0) 
    return new knit.engine.memory.NestedAttribute(attributeName, nestedRelation, this)
  }

  // p.defaultCompiler = function() { return knit.engine.memory.ToComputeInMemory }
  p.defaultCompiler = function() { return undefined }
  
  // p.compile = function() { return this.defaultCompiler()(this) }
  // p.defaultCompiler = function() { return knit.engine.memory.Executable.expressionCompiler() }
  //   
  //select.toInMemoryFunction() 
     //var f = this.relation.toInMemoryAlgorithm()
     //return function(row){
     //     
     //}
  
  //canonical_implementations
    // ==> name, attributes, function(row)
  //select(compiledRelation, predicate)
  //project(compiledRelation, attributes)
  
  //sync vs async...
    //compiledRelation.rows(function(row))
    //compiledRelation.rows()
  
  
  p.performSelect = function(predicate) {
    var attributes = this.attributes()
        rawPredicate = function(ignoreTheseAttributeNames, row) {
                         return predicate.match(attributes, row)
                       }
    var result = knit.algorithms.select({attributes:attributes.names(), rows:this.rows()}, rawPredicate)
    return this._newRelation(result.rows, this.name(), attributes.getAll(result.attributes)) 
  }
  
  p.performProject = function(keepAttributes) {
    var result = knit.algorithms.project({attributes:this.attributes().fullyQualifiedNames(), rows:this.rows()}, keepAttributes.fullyQualifiedNames())
    return this._newRelation(result.rows, this.name(), keepAttributes) 
  }

  function joinRows(combinedAttributes, outerRows, innerRows, predicate, candidateJoinRowFunction, 
                    innerAttributes, noInnerMatchFoundFunction) {
    var resultRows = []
    
    _.each(outerRows, function(outerRow){
      var innerRowMatchFound = false
      _.each(innerRows, function(innerRow){
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


  p._join = function(relationTwo, predicate, joinFunction) {
    var combinedAttributes = this.attributes().concat(relationTwo.attributes())
    var rawPredicate = function(ignoreTheseAttributeNames, row) {
                         return predicate.match(combinedAttributes, row)
                       }
    
    var result = 
      joinFunction(
        {attributes:this.attributes().fullyQualifiedNames(), rows:this.rows()},
        {attributes:relationTwo.attributes().fullyQualifiedNames(), rows:relationTwo.rows()},
        rawPredicate
      )
    return this._newRelation(result.rows, this.name() + "__" + relationTwo.name(), combinedAttributes) 
  }

  p.performJoin = function(relationTwo, predicate) {
    return this._join(relationTwo, predicate, knit.algorithms.join)
  }

  p.performLeftOuterJoin = function(relationTwo, predicate) {
    return this._join(relationTwo, predicate, knit.algorithms.leftOuterJoin)
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
          var leftAsNulls = [],
              leftAsNulls = _.repeat([null], leftAttributes.size()),
              rightRowWithNullLeftValues = [].concat(leftAsNulls).concat(rightRow)
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
      return _.select(dividendRows, function(dividendRow) {
        var divisorCandidate = _.get(dividendRow, divisorPositionsInDividend)
        return _.detect(divisorRows, function(divisorRow){return _.equals(divisorRow, divisorCandidate)})
      })
    }
    
    var quotientPositionsInDividend = dividendAttributes.indexesOf(quotientAttributes),
        qualifyingDividendRows = qualifyingDividendRows(dividendRows, dividendAttributes, divisorAttributes),
        quotientRows = [],
        currentQuotientRow = null
    _.each(qualifyingDividendRows, function(dividendRow){
      var candidateQuotientRow = _.get(dividendRow, quotientPositionsInDividend)
      if (currentQuotientRow==null || !_.equals(candidateQuotientRow, currentQuotientRow)) {
        quotientRows.push(candidateQuotientRow)
        currentQuotientRow = candidateQuotientRow
      }
    })
    return quotientRows
  }
  
  p.performDivide = function(divisor, quotientAttributes) {
    var quotientName = this.name() + "$$" + divisor.name(),
        quotientRows = divideRows(this.attributes(), this.rows(), 
                                  divisor.attributes(), divisor.rows(),
                                  quotientAttributes)
    return this._newRelation(quotientRows, quotientName, quotientAttributes)
  }

  p.performOrder = function(orderAttribute, direction) {
    var columnNumber = this.attributes().indexOf(orderAttribute),
        sortedRows = _.sortBy(this.rows(), function(row){ return row[columnNumber] })
    if (direction == knit.algebra.Order.DESC) sortedRows.reverse()
    return this._newRelation(sortedRows) 
  }

  p.performUnnest = function(nestedAttribute) {
    var nestedAttributeIndex = this.attributes().indexOf(nestedAttribute),
        newAttributes = this.attributes().splice(nestedAttribute.nestedRelation().attributes(), nestedAttributeIndex, 1),
        unnestedRows = []

    _.each(this.rows(), function(row) {
      var nestedRows = row[nestedAttributeIndex]
      _.each(nestedRows, function(nestedRow){
        unnestedRows.push(_.splice(row, nestedRow, nestedAttributeIndex, 1))
      })
    })
    return this._newRelation(unnestedRows, this.name(), newAttributes) 
  }
  
  p.performNest = function(nestedAttribute, newAttributeArrangement) {
    //assumption: this relation is ordered by all non-nested attributes.  
    //note that for now this is guaranteed by nest.perform.
    var self = this,
        oldNestedPositions = this.attributes().indexesOf(nestedAttribute.nestedRelation().attributes()),
        oldFlatPositions = this.attributes().indexesOf(newAttributeArrangement.without(nestedAttribute)),
        newFlatAttrPositionToOldFlatAttrPosition = {}
        
    newAttributeArrangement.each(function(newAttr, newPosition){
      if (!newAttr.isSame(nestedAttribute)) {
        var oldFlatPosition = self.attributes().indexOf(newAttr)
        newFlatAttrPositionToOldFlatAttrPosition[newPosition] = oldFlatPosition
      }
    })
    
    var nestedAttributePosition = newAttributeArrangement.indexOf(nestedAttribute),
        newRows = [],
        currentNewRow = null,
        currentFlatValues = null
    _.each(this.rows(), function(row) {
      var flatValuesForThisRow = _.get(row, oldFlatPositions),
          nestedValuesForThisRow = _.get(row, oldNestedPositions),
          allValuesAreNull = !(_.detect(nestedValuesForThisRow, function(value){return value != null}))
      
      if (currentFlatValues!=null && _.equals(flatValuesForThisRow, currentFlatValues)) {
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

knit.engine.memory.MutableRelation = function(name, attributeNamesAndTypes, primaryKey) {
  var result = new knit.engine.memory.Relation(name, attributeNamesAndTypes, primaryKey)
  knit._util.extend(result, {
    merge: function(rowsToAdd) {
      this._rowStore.merge(rowsToAdd)
      return this
    }
  })
  return result
}
