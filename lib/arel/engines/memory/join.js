arel.Engines.Memory.CartesianJoin = function(relationOne, relationTwo){
  var combinedName = relationOne.name() + "__" + relationTwo.name()
  var combinedAttributes = relationOne.attributes().concat(relationTwo.attributes())

  _.extend(this, new arel.Engines.Memory.Relation(combinedName, combinedAttributes))
  
  this.tuplesSync = function(){
    var cartesianProduct = []
    _.each(relationOne.tuplesSync(), function(oneTuple){
      _.each(relationTwo.tuplesSync(), function(twoTuple){
        cartesianProduct.push(oneTuple.concat(twoTuple))
      })
    })
    return cartesianProduct
  }

}