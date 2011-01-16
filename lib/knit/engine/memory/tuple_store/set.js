knit.engine.Memory.SetTupleStore = function(keyColumns, initialTuples) {
  this._keyColumns = keyColumns
  this._tuples = initialTuples || []
}

_.extend(knit.engine.Memory.SetTupleStore.prototype, {
  mergeSync: function(moreTuples) {
    //pretty bad perf...
    var keyToTuple = {}
    var keyToArrayIndex = {}
    var self = this
    
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
  },
  
  all: function(){ return this._tuples }
})