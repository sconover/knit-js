//quacksLike relation
knit.ExecutableRelation = function() {
  var _ = knit._util,
      F = function(executionStrategy) {
            this._executionStrategy = executionStrategy
          },
      p = F.prototype
  
  _.each(["name", "attributes", "columns", "attr", "inspect",
          "merge", "split", "newNestedAttribute", "isEquivalent", "isSame"], function(methodNameToDelegate) {
    p[methodNameToDelegate] = function() { 
      return this._executionStrategy[methodNameToDelegate].apply(this._executionStrategy, arguments) 
    }
  })

  function rowToObject(row, attributeNames) {
    var object = {}
    _.each(attributeNames, function(attributeName, i){
      var nested = typeof attributeName == "object"
      if (nested) {
        var nestedRows = row[i]
        var thisAttributeName = _.keys(attributeName)[0]
        var nestedAttributeNames = _.values(attributeName)[0]
        object[thisAttributeName] = rowsToObjects(nestedRows, nestedAttributeNames)
      } else {
        object[attributeName] = row[i]
      }
    })
    return object
  }

  function rowsToObjects(rows, attributeNames) {
    return _.map(rows, function(row){ return rowToObject(row, attributeNames) })
  }
  
  p.objects = function(objectCallback) {
    var attributeNames = this.attributes().structuredNames()
    var rowConverter = function(row){ return rowToObject(row, attributeNames) }
    if (objectCallback) {
      this.rows(function(row){
        if (row == null) {
          objectCallback(null)
        } else {
          objectCallback(rowToObject(row, attributeNames))
        }
      })
    } else {
      return rowsToObjects(this.rows(), attributeNames)
    }
  }
    
  p.rows = function(rowCallback) {
    if (rowCallback) {
      this._executionStrategy.rowsAsync(this, rowCallback)
    } else {
      return this._executionStrategy.rowsSync(this)
    }
  }
  
  p.cost = function() { return this._executionStrategy.cost(this) }
  
  return F
}()
