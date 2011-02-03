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
  }).makeObjectStyleFunctions(function(){return this})
  
  knit._.each(["clone", "concat", "inspect", "without", "each", "indexOf"], function(functionName) {
    p[functionName] = cf[functionName]
  })
  p.isSame = p.isEquivalent = cf.equals
  p.splice2 = cf.splice
  p.names = function(){return cf.map.apply(this, [function(item){return item.name()}])}
  
  p.forEach = function(iterator, context){
    _.each(this.attributeArray, function(attr, i){
      iterator.call(context, attr, i, this.attributeArray);
    })
  }
  
  p.spliceNestedAttribute = function(nestedAttribute) {
    // return cf.map.apply(this, [function(item){return item.name()}])
    
    var attributePositions = knit._.map(nestedAttribute.nestedRelation().attributes(), function(attr){
      return cf.indexOf.apply(this, [attr])
    })
    attributePositions.sort()
    var firstAttributePosition = attributePositions[0]
    
    var newAttributes = cf.differ.apply(this, [nestedAttribute.nestedRelation().attributes()])
    newAttributes.splice()
    cf.splice.apply(newAttributes, [nestedAttribute])
    
    // var result = this.relation.attributes().clone()
    // var self = this
    // var attributePositions = _.map(this.nestedAttribute.nestedRelation().attributes(), function(attribute){
    //   return knit.indexOfSame(result, attribute)
    // })
    // attributePositions.sort()
    // var firstAttributePosition = attributePositions.shift()
    // result.splice(firstAttributePosition,1,this.nestedAttribute)
    //   
    // attributePositions.reverse()
    // _.each(attributePositions, function(pos){result.splice(pos,1)})
    // return result
    // 
  }
  
  p.splice = function(){ this.attributeArray.splice.apply(this.attributeArray, arguments)}
  p.length = cf.size
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