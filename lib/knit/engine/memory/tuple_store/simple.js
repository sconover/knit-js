knit.engine.Memory.SimpleTupleStore = function(initialTuples) {
  this._tuples = initialTuples || []
}

_.extend(knit.engine.Memory.SimpleTupleStore.prototype, {
  mergeSync: function(moreTuples) {
    this._tuples = this._tuples.concat(moreTuples)
  },
  
  all: function(){ return this._tuples }
})