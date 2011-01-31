require("knit/core")

knit.algebra.Attributes = function() {
  
  var F = function(attributeArray) {
    if (attributeArray.constructor == knit.algebra.Attributes) assert.equal(false, true)
    
    this.attributeArray = attributeArray
  }; var p = F.prototype
  
  p.isSame = p.isEquivalent = function(other) {
    return other.constructor == F && 
           !_.detect(_.zip(this.attributeArray, other.attributeArray), function(entry){
             var thisItem = entry[0]
             var otherItem = entry[1]
             return !(entry[0]) || !(entry[1]) || !entry[0].isSame(entry[1])
           })
  }
  
  p.forEach = function(iterator, context){
    _.each(this.attributeArray, function(attr, i){
      iterator.call(context, attr, i, this.attributeArray);
    })
  }
  
  p.concat = function(other){ return new F([].concat(this.attributeArray).concat(other.attributeArray))}
  p.splice = function(){ this.attributeArray.splice.apply(this.attributeArray, arguments)}
  p.length = function(){ return this.attributeArray.length}
  p.toArray = function(){ return [].concat(this.attributeArray)}
  
  p.shallowCopy = function(){return new knit.algebra.Attributes([].concat(this.attributeArray))}
  
  p.inspect = function(){return _.map(this.attributeArray, function(attr){return attr.inspect()}).join(",")}
  
  return F
}()