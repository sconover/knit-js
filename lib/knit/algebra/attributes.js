require("knit/core")

knit.algebra.Attributes = function() {
  
  var F = function(attributeArray) {
    this.attributeArray = attributeArray
  }; var p = F.prototype


  CollectionFunctions(
    function(attributes) { return CollectionFunctions.Array.functions.newIterator(attributes.attributeArray)}, 
    function(){return null}, 
    function(a,b){return a && b && a.isSame && b.isSame && a.isSame(b)},
    function(){return new F([])},
    function(attributes, attribute){attributes.attributeArray.push(attribute)},
    function(object){return object.constructor == F}
  ).decorateObjectStyle(p, function(){return this})
  
  p.isSame = p.isEquivalent = p.equals
  
  p.forEach = function(iterator, context){
    _.each(this.attributeArray, function(attr, i){
      iterator.call(context, attr, i, this.attributeArray);
    })
  }
  
  p.splice = function(){ this.attributeArray.splice.apply(this.attributeArray, arguments)}
  p.length = function(){ return this.attributeArray.length}
  p.toArray = function(){ return [].concat(this.attributeArray)}
  
  return F
}()