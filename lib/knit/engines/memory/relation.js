knit.Engines.Memory.Relation = function(name, attributes){
  return knit.createObject(new knit.ImmutableRelation(name, attributes), {
    join: function(otherRelation) {
      return new knit.Engines.Memory.CartesianJoin(this, otherRelation)
    },
    project: function(attributesToKeep) {
      return new knit.Engines.Memory.Projection(this, attributesToKeep)
    }
  })
}


knit.Engines.Memory.ImmutableRelation = function(name, attributes){
  _.extend(this, new knit.Engines.Memory.Relation(name, attributes))
  
  var storage = []
    
  this._storage = function(){
    return storage
  }
  
  this.tuplesSync = function(){
    return this._storage()
  }
}

knit.Engines.Memory.prototype.mutableRelation = function(name, attributes){
  return new knit.Engines.Memory.MutableRelation(name, attributes)
}

knit.Engines.Memory.MutableRelation = function(name, attributes){
  _.extend(this, new knit.MutableRelation(name, attributes))
  _.extend(this, new knit.Engines.Memory.ImmutableRelation(name, attributes))
  
  this.insertSync = function(tuples){
    _.each(tuples, function(tuple){this._storage().push(tuple)}.bind(this))
    return this
  }  
}

