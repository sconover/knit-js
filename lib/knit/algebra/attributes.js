require("knit/core")

knit.algebra.Attributes = function() {
  
  var F = function(attributeArray) {
    this.attributeArray = attributeArray
  }; var p = F.prototype
  
  p.isSame = p.isEquivalent = function(other) {
    return other.constructor == F && 
           !_.detect(this.attributeArray, function(myAttr, i){
            return !myAttr.isSame(other.attributeArray[i])
           })
  }
  
  p.inspect = function(){return _.map(this.attributeArray, function(attr){return attr.inspect()}).join(",")}
  
  return F
}()