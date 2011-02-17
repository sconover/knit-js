require("knit/namespace")
require("knit/core/util")

knit.algorithms = (function(){
  var _ = knit._util
  
  function select(relation, predicate) {
    var matchingRows = _.select(relation.rows, function(row){
                         return predicate(row)
                       })        
    return {attributes:relation.attributes, rows:matchingRows}
  }
  
  function project(relation, keepAttributes) {
    var positionsToKeep = _.indexesOf(relation.attributes, keepAttributes)
        projectedRows = _.map(relation.rows, function(row) {
                          return _.map(positionsToKeep, function(position) {
                            return row[position]
                          })
                        })
    return {attributes:keepAttributes, rows:projectedRows}
  }

  function orderAsc(relation, orderAttribute) {
    var columnNumber = _.indexOf(relation.attributes, orderAttribute),
        sortedRows = _.sortBy(relation.rows, function(row){ return row[columnNumber] })

    return {attributes:relation.attributes, rows:sortedRows}
  }

  function orderDesc(relation, orderAttribute) {
    return {attributes:relation.attributes, rows:orderAsc(relation, orderAttribute).rows.reverse()}
  }



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
  
  var TRUE_PREDICATE = function(){return true}
  
  function join(relationOne, relationTwo, predicate) {
    predicate = predicate || TRUE_PREDICATE
    var combinedAttributes = relationOne.attributes.concat(relationTwo.attributes)           
    
    var combinedRows = 
      joinRows(
        combinedAttributes,
        relationOne.rows,
        relationTwo.rows,
        predicate,
        function(leftRow, rightRow){return [].concat(leftRow).concat(rightRow)}
      )

    return {attributes:combinedAttributes, rows:combinedRows}
  }
  
  function leftOuterJoin(relationOne, relationTwo, predicate) {
    predicate = predicate || TRUE_PREDICATE
    var combinedAttributes = relationOne.attributes.concat(relationTwo.attributes)           
    
    var combinedRows = 
      joinRows(
        combinedAttributes,
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

    return {attributes:combinedAttributes, rows:combinedRows}
  }
  
  function rightOuterJoin(relationOne, relationTwo, predicate) {
    predicate = predicate || TRUE_PREDICATE
    var combinedAttributes = relationOne.attributes.concat(relationTwo.attributes)           
    
    var combinedRows = 
      joinRows(
        combinedAttributes,
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

    return {attributes:combinedAttributes, rows:combinedRows}
  }
  
  
  var _N = CollectionFunctions.Array.
              appendFeatures({
                equals:function(a,b){
                  return _.deepEqual(a, b)
                }
              }).functions

  
  
  function nest(relation, nestedAttribute, newAttributeArrangement) {
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
    
    return {attributes:newAttributeArrangement, rows:newRows}
  }
  
  function unnest(relation, nestedAttribute) {
    var nestedRelationAttributes = _.values(nestedAttribute)[0],
        nestedAttributeIndex = _N.indexOf(relation.attributes, nestedAttribute),
        newAttributes = _N.splice(relation.attributes, nestedRelationAttributes, nestedAttributeIndex, 1),
        unnestedRows = []

    _.each(relation.rows, function(row) {
      var nestedRows = row[nestedAttributeIndex]
      _.each(nestedRows, function(nestedRow){
        unnestedRows.push(_.splice(row, nestedRow, nestedAttributeIndex, 1))
      })
    })
    
    return {attributes:newAttributes, rows:unnestedRows}
  }
  
  
  return {select:select, 
          project:project, 
          join:join, leftOuterJoin:leftOuterJoin, rightOuterJoin:rightOuterJoin,
          orderAsc:orderAsc, orderDesc:orderDesc,
          nest:nest, unnest:unnest}
})()