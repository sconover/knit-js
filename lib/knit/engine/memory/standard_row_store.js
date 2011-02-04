knit.engine.Memory.StandardRowStore = function(){
  var _A = CollectionFunctions.Array.functions
  
  var F = function(keyColumns, initialRows) {
    this._keyColumns = keyColumns
    this._rows = initialRows || []
  }; var p = F.prototype

  p.merge = function(moreRows) {
    
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
      
      _A.each(self._rows, function(row, i){
        var key = _A.map(self._keyColumns, function(arrayIndex){return "" + row[arrayIndex]}).join("_")
        keyToRow[key] = row
        keyToArrayIndex[key] = i
      })
    
      _A.each(moreRows, function(newRow){
        var newKey = _A.map(self._keyColumns, function(arrayIndex){return "" + newRow[arrayIndex]}).join("_")
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
  
  p.rows = function(){ return this._rows }
  
  return F
}()