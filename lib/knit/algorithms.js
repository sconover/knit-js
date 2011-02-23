require("knit/namespace")
require("knit/core/util")

knit.algorithms = (function(){
  var _ = knit._util
  
  function algorithmFunction(attributesFunction, rowsFunction) {
    var main = function() {
      var args = _.toArray(arguments)
      return {attributes:attributesFunction.apply(null, args), rows:rowsFunction.apply(null, args)}
    }
    main.attributes = attributesFunction
    main.rows = rowsFunction
    return main
  }
  
  function sameAttributes(relation) {
    return relation.attributes
  }
  
  function selectRows(relation, predicate) {
    return _.select(relation.rows, function(row){
             return predicate(row)
           })        
  }
  var select = algorithmFunction(sameAttributes, selectRows)

  
  function projectAttributes(relation, keepAttributes) {
    return keepAttributes
  }
  
  function projectRows(relation, keepAttributes) {
    var positionsToKeep = _.indexesOf(relation.attributes, keepAttributes)
    return _.map(relation.rows, function(row) {
            return _.map(positionsToKeep, function(position) {
              return row[position]
            })
          })
  }
  var project = algorithmFunction(projectAttributes, projectRows)


  function orderAscRows(relation, orderAttribute) {
    var columnNumber = _.indexOf(relation.attributes, orderAttribute)
    return _.sortBy(relation.rows, function(row){ return row[columnNumber] })
  }
  var orderAsc = algorithmFunction(sameAttributes, orderAscRows)

  function orderDescRows(relation, orderAttribute) {
    return orderAscRows(relation, orderAttribute).reverse()
  }
  var orderDesc = algorithmFunction(sameAttributes, orderDescRows)


  function joinRows(combinedAttributes, outerRows, innerRows, predicate, candidateJoinRowFunction, 
                    innerAttributes, noInnerMatchFoundFunction) {
    var resultRows = []
    
    _.each(outerRows, function(outerRow){
      var innerRowMatchFound = false
      _.each(innerRows, function(innerRow){
        var candidateJoinRow = candidateJoinRowFunction(outerRow, innerRow) 
        if (predicate(candidateJoinRow)) {
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
  
  function combineAttributes(relationOne, relationTwo) {
    return relationOne.attributes.concat(relationTwo.attributes)           
  }
  
  var TRUE_PREDICATE = function(){return true}
  
  function standardJoinRows(relationOne, relationTwo, predicate) {
    predicate = predicate || TRUE_PREDICATE
    
    return joinRows(
              combineAttributes(relationOne, relationTwo),
              relationOne.rows,
              relationTwo.rows,
              predicate,
              function(leftRow, rightRow){return [].concat(leftRow).concat(rightRow)}
            )
  }
  var join = algorithmFunction(combineAttributes, standardJoinRows)
  
  function leftOuterJoinRows(relationOne, relationTwo, predicate) {
    predicate = predicate || TRUE_PREDICATE
    
    return joinRows(
             combineAttributes(relationOne, relationTwo),
             relationOne.rows,
             relationTwo.rows,
             predicate,
             function(leftRow, rightRow){return [].concat(leftRow).concat(rightRow)},
             relationTwo.attributes,
             function(rightAttributes, leftRow, joinRows){
               var rightAsNulls = _.repeat([null], rightAttributes.length),
                   leftRowWithNullRightValues = [].concat(leftRow).concat(rightAsNulls)
               joinRows.push(leftRowWithNullRightValues)
             }
           )
  }
  var leftOuterJoin = algorithmFunction(combineAttributes, leftOuterJoinRows)
  
  function rightOuterJoinRows(relationOne, relationTwo, predicate) {
    predicate = predicate || TRUE_PREDICATE
    
    return joinRows(
             combineAttributes(relationOne, relationTwo),
             relationTwo.rows,
             relationOne.rows,
             predicate,
             function(rightRow, leftRow){return [].concat(leftRow).concat(rightRow)},
             relationOne.attributes,
             function(leftAttributes, rightRow, joinRows){
               var leftAsNulls = [],
                   leftAsNulls = _.repeat([null], leftAttributes.length),
                   rightRowWithNullLeftValues = [].concat(leftAsNulls).concat(rightRow)
               joinRows.push(rightRowWithNullLeftValues)
             }
           )
  }
  var rightOuterJoin = algorithmFunction(combineAttributes, rightOuterJoinRows)
  

  function makeAttributesIntoPredicate(attributes, relationOne, relationTwo) {  
    if (attributes.length == 1) {
      var attribute = attributes.shift(),
          positionInRelationOne = _.indexOf(relationOne.attributes, attribute),
          positionInRelationTwo = _.indexOf(relationTwo.attributes, attribute)
      return function(row){return row[positionInRelationOne] == row[relationOne.attributes.length + positionInRelationTwo]}
    } else if (attributes.length > 1) {
      var attributeOne = attributes.shift(),
          leftPredicate = makeAttributesIntoPredicate([attributeOne], relationOne, relationTwo),
          rightPredicate = makeAttributesIntoPredicate(attributes, relationOne, relationTwo)
      return function(row) {return leftPredicate(row) && rightPredicate(row)}
    } else {
      return TRUE_PREDICATE
    }
  }

  function commonAttributesHavingSuffix(relationOne, relationTwo, suffix) {
    suffix = suffix || ".*"
    var commonAttributes = _.intersect(relationOne.attributes, relationTwo.attributes),
        regexp = new RegExp(suffix + "$")
    return _.select(commonAttributes, function(attribute){return attribute.match(regexp)})
  }
    
  function naturalJoinRows(relationOne, relationTwo, suffix) {
    var predicate = 
      makeAttributesIntoPredicate(
        _.uniq(commonAttributesHavingSuffix(relationOne, relationTwo, suffix)),
        relationOne, 
        relationTwo
      )
    return standardJoinRows(relationOne, relationTwo, predicate)
  }
  var naturalJoin = algorithmFunction(combineAttributes, naturalJoinRows)
  
  
  
  var _N = CollectionFunctions.Array.
              appendFeatures({
                equals:function(a,b){
                  return _.deepEqual(a, b)
                }
              }).functions

  
  function attributesForNest(relation, nestedAttribute, newAttributeArrangement) {
    return newAttributeArrangement
  }
  
  function nestRows(relation, nestedAttribute, newAttributeArrangement) {
    //assumption: this relation is ordered by all non-nested attributes.  
    //note that for now this is guaranteed by nest.perform.
        
    function mapFlatPositions() {
      var newFlatAttrPositionToOldFlatAttrPosition = {}
      _.each(newAttributeArrangement, function(newAttr, newPosition){
        if (!_.deepEqual(newAttr, nestedAttribute)) {
          var oldFlatPosition = _N.indexOf(relation.attributes, newAttr)
          newFlatAttrPositionToOldFlatAttrPosition[newPosition] = oldFlatPosition
        }
      })
      return newFlatAttrPositionToOldFlatAttrPosition
    }
    

    var nestedRelationAttributes = _.values(nestedAttribute)[0]
    
    var oldNestedPositions = _N.indexesOf(relation.attributes, nestedRelationAttributes),
        oldFlatPositions = _N.indexesOf(relation.attributes, _N.without(newAttributeArrangement, nestedAttribute)),
        newFlatAttrPositionToOldFlatAttrPosition = mapFlatPositions()

    var nestedAttributePosition = _N.indexOf(newAttributeArrangement, nestedAttribute)

    var newRows = [],
        currentNewRow = null,
        currentFlatValues = null
        
    _.each(relation.rows, function(row) {
      var flatValuesForThisRow = _.get(row, oldFlatPositions),
          nestedValuesForThisRow = _.get(row, oldNestedPositions),
          allValuesAreNull = !(_.detect(nestedValuesForThisRow, function(value){return value != null}))
      
      if (currentFlatValues!=null && _.equals(flatValuesForThisRow, currentFlatValues)) {
        if ( ! allValuesAreNull) currentNewRow[nestedAttributePosition].push(nestedValuesForThisRow)
      } else {
        if (currentNewRow) newRows.push(currentNewRow)
        
        currentNewRow = _.map(newAttributeArrangement, function(attr, newPos){
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
    
    return newRows
  }
  var nest = algorithmFunction(attributesForNest, nestRows)
  
  function flattenNestedAttribute(relation, nestedAttribute) {
    var nestedRelationAttributes = _.values(nestedAttribute)[0],
        nestedAttributeIndex = _N.indexOf(relation.attributes, nestedAttribute)
    return _N.splice(relation.attributes, nestedRelationAttributes, nestedAttributeIndex, 1)
  }
  
  function unnestRows(relation, nestedAttribute) {
    var nestedAttributeIndex = _N.indexOf(relation.attributes, nestedAttribute),
        newAttributes = flattenNestedAttribute(relation, nestedAttribute),
        unnestedRows = []

    _.each(relation.rows, function(row) {
      var nestedRows = row[nestedAttributeIndex]
      _.each(nestedRows, function(nestedRow){
        unnestedRows.push(_.splice(row, nestedRow, nestedAttributeIndex, 1))
      })
    })
    
    return unnestedRows
  }
  var unnest = algorithmFunction(flattenNestedAttribute, unnestRows)
  
  
  function divideRows(dividendAttributes, dividendRows, divisorAttributes, divisorRows, quotientAttributes) {
    function qualifyingDividendRows(dividendRows, dividendAttributes, divisorAttributes) {
      var divisorPositionsInDividend = _.indexesOf(dividendAttributes, divisorAttributes)
      //efficiency later
      return _.select(dividendRows, function(dividendRow) {
        var divisorCandidate = _.get(dividendRow, divisorPositionsInDividend)
        return _.detect(divisorRows, function(divisorRow){return _.equals(divisorRow, divisorCandidate)})
      })
    }
    
    var quotientPositionsInDividend = _.indexesOf(dividendAttributes, quotientAttributes),
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
  
  function quotientAttributes(dividend, divisor) {
    return _.differ(dividend.attributes, divisor.attributes)
  }
  function quotientRows(relation, divisor) {
    return divideRows(relation.attributes, relation.rows, 
                      divisor.attributes, divisor.rows,
                      quotientAttributes(relation, divisor))
  }
  var divide = algorithmFunction(quotientAttributes, quotientRows)  
  
  
  return {select:select, 
          project:project, 
          join:join, leftOuterJoin:leftOuterJoin, rightOuterJoin:rightOuterJoin, naturalJoin:naturalJoin,
          divide: divide,
          orderAsc:orderAsc, orderDesc:orderDesc,
          nest:nest, unnest:unnest}
})()