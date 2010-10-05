require("arel/core");
require("arel/projection");

arel.Engines = arel.Engines || {};

arel.Engines.Memory = function(){};

arel.Engines.Memory.Relation = function(name, attributes){
  _.extend(this, new arel.ImmutableRelation(name, attributes));
  
  this.join = function(otherRelation) {
    return new arel.Engines.Memory.CartesianJoin(this, otherRelation);
  };

  this.project = function(attributesToKeep) {
    return new arel.Engines.Memory.Projection(this, attributesToKeep);
  };
};


arel.Engines.Memory.ImmutableRelation = function(name, attributes){
  _.extend(this, new arel.Engines.Memory.Relation(name, attributes));
  
  var storage = [];
    
  this._storage = function(){
    return storage;
  };
  
  this.tuplesSync = function(){
    return this._storage();
  };
};

arel.Engines.Memory.prototype.mutableRelation = function(name, attributes){
  return new arel.Engines.Memory.MutableRelation(name, attributes);
}

arel.Engines.Memory.MutableRelation = function(name, attributes){
  _.extend(this, new arel.MutableRelation(name, attributes));
  _.extend(this, new arel.Engines.Memory.ImmutableRelation(name, attributes));
  
  this.insertSync = function(tuples){
    _.each(tuples, function(tuple){this._storage().push(tuple)}.bind(this));
    return this;
  };  
};



arel.Engines.Memory.CartesianJoin = function(relationOne, relationTwo){
  var combinedName = relationOne.name() + "__" + relationTwo.name();
  var combinedAttributes = relationOne.attributes().concat(relationTwo.attributes());

  _.extend(this, new arel.Engines.Memory.Relation(combinedName, combinedAttributes));
  
  this.tuplesSync = function(){
    var cartesianProduct = [];
    _.each(relationOne.tuplesSync(), function(oneTuple){
      _.each(relationTwo.tuplesSync(), function(twoTuple){
        cartesianProduct.push(oneTuple.concat(twoTuple));
      });
    });
    return cartesianProduct;
  };

};

arel.Engines.Memory.Projection = function(relation, attributesToKeep){
  _.extend(this, new arel.Projection(relation, attributesToKeep));
  this.tuplesSync = function(){
    var indexesToKeep = [];
    var relationAttributes = relation.attributes();
    for(var i=0; i<relationAttributes.length; i++){
      if (_(attributesToKeep).include(relationAttributes[i])) {
        indexesToKeep.push(i);
      };
    };
    
    return _.map(relation.tuplesSync(), function(tuple){
      return _.map(indexesToKeep, function(i){return tuple[i]});
    });
  };

};