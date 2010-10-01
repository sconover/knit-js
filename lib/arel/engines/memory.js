require("arel/core");

arel.Engines = arel.Engines || {}

arel.Engines.Memory = function(){};

arel.Engines.Memory.prototype.mutableRelation = function(name, attributes){
  return new arel.Engines.Memory.MutableRelation(name, attributes);
}

arel.Engines.Memory.MutableRelation = function(name, attributes){
  _.extend(this, new arel.MutableRelation(name, attributes));
  
  var storage = [];
  
  this.insertSync = function(tuples){
    _.each(tuples, function(tuple){storage.push(tuple)});
    return this;
  };
  
  this.tuplesSync = function(){
    return storage;
  };
};