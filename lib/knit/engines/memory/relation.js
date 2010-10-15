require("knit/relation")

knit.Engines.Memory.relationSupport = function(){
  var storage = []
  
  return {
    _storage: function(){
      return storage
    },
    tuplesSync: function(){
      return this._storage()
    }
  }
}

knit.Engines.Memory.prototype.immutableRelation = function(name, attributes){
  var storage = []
  
  return knit.createObject(
           new knit.ImmutableRelation(name, attributes), 
           knit.Engines.Memory.relationSupport()
         )
}

knit.Engines.Memory.prototype.mutableRelation = function(name, attributes){
  var relation = knit.createObject(
    new knit.MutableRelation(name, attributes), 
    knit.Engines.Memory.relationSupport()
  )
  relation.insertSync = function(tuples){
    _.each(tuples, function(tuple){this._storage().push(tuple)}.bind(this))
    return this
  }  
  return relation
}
