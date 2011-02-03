require("knit/core")

knit.algebra.Attributes = function() {
  
  var F = function(attributeArray) {
    this.attributeArray = attributeArray
  }; var p = F.prototype


  var cf = CollectionFunctions({
    iterator:function(attributes) { return CollectionFunctions.Array.functions.iterator(attributes.attributeArray)}, 
    nothing:function(){return null}, 
    equals:function(a,b){return a && b && a.isSame && b.isSame && a.isSame(b)},
    newCollection:function(){return new F([])},
    append:function(attributes, attribute){attributes.attributeArray.push(attribute)}
  })
  
  var curriedCF = cf.makeObjectStyleFunctions(function(){return this})
  p._ = cf.functions
  
  knit._.each(["clone", "concat", "inspect", "without", "each", "indexOf"], function(functionName) {
    p[functionName] = curriedCF[functionName]
  })
  p.isSame = p.isEquivalent = curriedCF.equals
  p.splice2 = curriedCF.splice
  p.names = function(){return this._.map(this, function(item){return item.name()})}
  
  p.forEach = function(iterator, context){
    _.each(this.attributeArray, function(attr, i){
      iterator.call(context, attr, i, this.attributeArray);
    })
  }
  
  p.spliceInNestedAttribute = function(nestedAttribute) {
    var self = this
    var attributePositions = this._.map(nestedAttribute.nestedRelation().attributes(), function(attr){
      return self._.indexOf(self, attr)
    })
    
    attributePositions.sort()
    var firstNestedAttributePosition = attributePositions[0]
    
    var newAttributes = this._.differ(this, nestedAttribute.nestedRelation().attributes())
    return this._.splice(newAttributes, new F([nestedAttribute]), firstNestedAttributePosition)
  }
  
  p.splice = function(){ this.attributeArray.splice.apply(this.attributeArray, arguments)}
  p.length = curriedCF.size
  p.toArray = function(){ return [].concat(this.attributeArray)}
  
  p.makeObjectFromRow = function(row) {
    var object = {}
    this.each(function(attr, columnPosition) {
      var value = row[columnPosition]
      var propertyName = attr.name()
      if (attr.nestedRelation) {
        object[propertyName] = attr.nestedRelation().objects(value)
      } else {
        object[propertyName] = value
      }
    })
    return object
  }
  
  return F
}()