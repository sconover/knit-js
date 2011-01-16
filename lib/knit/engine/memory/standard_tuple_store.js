knit.engine.Memory.StandardTupleStore = function(keyColumns, initialTuples) {
  this._keyColumns = keyColumns
  this._tuples = initialTuples || []
}

_.extend(knit.engine.Memory.StandardTupleStore.prototype, {
  mergeSync: function(moreTuples) {
    
    var self = this
    
    function hasKey() {
      return self._keyColumns.length >= 1
    }
    
    function treatAsSet(moreTuples) {
      //pretty bad perf...
      var keyToTuple = {}
      var keyToArrayIndex = {}
      
      _.each(self._tuples, function(tuple, i){
        var key = _.map(self._keyColumns, function(arrayIndex){return "" + tuple[arrayIndex]}).join("_")
        keyToTuple[key] = tuple
        keyToArrayIndex[key] = i
      })
    
      _.each(moreTuples, function(newTuple){
        var newKey = _.map(self._keyColumns, function(arrayIndex){return "" + newTuple[arrayIndex]}).join("_")
        if (keyToTuple[newKey]) {
          var i = keyToArrayIndex[newKey]
          self._tuples[i] = newTuple
        } else {
          self._tuples.push(newTuple)
        }
      })
    }
    
    if (hasKey()) {
      treatAsSet(moreTuples)
    } else {
      self._tuples = self._tuples.concat(moreTuples)
    }
  },
  
  all: function(){ return this._tuples }
})