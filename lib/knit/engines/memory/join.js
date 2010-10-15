require("knit/relation")

knit.Engines.Memory.prototype.join = function(relationOne, relationTwo) {
  var combinedName = relationOne.name() + "__" + relationTwo.name()
  var combinedAttributes = relationOne.attributes().concat(relationTwo.attributes())

  return knit.createObject(
    this.immutableRelation(combinedName, combinedAttributes),{
    tuplesSync: function(){
      var cartesianProduct = []
      _.each(relationOne.tuplesSync(), function(oneTuple){
        _.each(relationTwo.tuplesSync(), function(twoTuple){
          cartesianProduct.push(oneTuple.concat(twoTuple))
        })
      })
      return cartesianProduct
    }
  })  
}