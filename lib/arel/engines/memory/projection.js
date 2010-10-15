require("arel/projection")

arel.Engines.Memory.Projection = function(relation, attributesToKeep){
  return arel.createObject(new arel.Projection(relation, attributesToKeep), {
    tuplesSync: function(){
      var indexesToKeep = []
      var relationAttributes = relation.attributes()
      for(var i=0; i<relationAttributes.length; i++){
        if (_(attributesToKeep).include(relationAttributes[i])) {
          indexesToKeep.push(i)
        }
      }
  
      return _.map(relation.tuplesSync(), function(tuple){
        return _.map(indexesToKeep, function(i){return tuple[i]})
      })
    }
  })
  
}