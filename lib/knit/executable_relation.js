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
      object[attributeName] = row[i]
    })
    return object
  }
  
  p.objects = function(objectCallback) {
    var attributeNames = this.attributes().names()
    var rowConverter = function(row){ return rowToObject(row, attributeNames) }
    if (objectCallback) {
      this.rows(function(row){
        if (row == null) {
          objectCallback(null)
        } else {
          objectCallback(rowConverter(row))
        }
      })
    } else {
      return _.map(this.rows(), rowConverter)
    }
  }
    
  p.rows = function(rowCallback) {
    if (rowCallback) {
      this._executionStrategy.rowsAsync(this, rowCallback)
    } else {
      return this._executionStrategy.rowsSync(this)
    }
  }
  
  return F
}()
