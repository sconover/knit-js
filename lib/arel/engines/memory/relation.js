arel.Engines.Memory.Relation = function(name, attributes){
  return arel.createObject(new arel.ImmutableRelation(name, attributes), {
    join: function(otherRelation) {
      return new arel.Engines.Memory.CartesianJoin(this, otherRelation)
    },
    project: function(attributesToKeep) {
      return new arel.Engines.Memory.Projection(this, attributesToKeep)
    }
  })
}


arel.Engines.Memory.ImmutableRelation = function(name, attributes){
  _.extend(this, new arel.Engines.Memory.Relation(name, attributes))
  
  var storage = []
    
  this._storage = function(){
    return storage
  }
  
  this.tuplesSync = function(){
    return this._storage()
  }
}

arel.Engines.Memory.prototype.mutableRelation = function(name, attributes){
  return new arel.Engines.Memory.MutableRelation(name, attributes)
}

arel.Engines.Memory.MutableRelation = function(name, attributes){
  _.extend(this, new arel.MutableRelation(name, attributes))
  _.extend(this, new arel.Engines.Memory.ImmutableRelation(name, attributes))
  
  this.insertSync = function(tuples){
    _.each(tuples, function(tuple){this._storage().push(tuple)}.bind(this))
    return this
  }  
}

