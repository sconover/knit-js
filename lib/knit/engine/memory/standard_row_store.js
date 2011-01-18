knit.engine.Memory.StandardRowStore = function(keyColumns, initialRows) {
  this._keyColumns = keyColumns
  this._rows = initialRows || []
}

_.extend(knit.engine.Memory.StandardRowStore.prototype, {
  merge: function(moreRows) {
    
    var self = this
    
    function hasKey() {
      return self._keyColumns.length >= 1
    }
    
    function treatAsSet(moreRows) {
      //pretty bad perf...
        //future...cost-aware array?
        //test-drive to lower cost...
        //this._rows.with(function(arr){
        //   ...tracks cost of all iterating you do in here  
        //})
        //
        //Also, cost-aware map
          //check out js map
      var keyToRow = {}
      var keyToArrayIndex = {}
      
      _.each(self._rows, function(row, i){
        var key = _.map(self._keyColumns, function(arrayIndex){return "" + row[arrayIndex]}).join("_")
        keyToRow[key] = row
        keyToArrayIndex[key] = i
      })
    
      _.each(moreRows, function(newRow){
        var newKey = _.map(self._keyColumns, function(arrayIndex){return "" + newRow[arrayIndex]}).join("_")
        if (keyToRow[newKey]) {
          var i = keyToArrayIndex[newKey]
          self._rows[i] = newRow
        } else {
          self._rows.push(newRow)
        }
      })
    }
    
    if (hasKey()) {
      treatAsSet(moreRows)
    } else {
      self._rows = self._rows.concat(moreRows)
    }
  },
  
  rows: function(){ return this._rows }
})