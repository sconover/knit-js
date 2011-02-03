require("knit/core")

knit.algebra.Attributes = function() {
  
  var F = function(attributeArray) {
    this.attributeArray = attributeArray
  }; var p = F.prototype

  var _A = CollectionFunctions.Array.functions
  
  var localCF = CollectionFunctions({
    iterator:function(attributes) { return _A.iterator(attributes.attributeArray)}, 
    nothing:function(){return null}, 
    equals:function(a,b){return a && b && a.isSame && b.isSame && a.isSame(b)},
    newCollection:function(){return new F([])},
    append:function(attributes, attribute){attributes.attributeArray.push(attribute)}
  })
  
  
  var _ = localCF.functions
  var objectStyleCF = localCF.makeObjectStyleFunctions(function(){return this})
  _A.each(["clone", "concat", "inspect", "without", "each", "indexOf"], function(functionName) {
    p[functionName] = objectStyleCF[functionName]
  })
  p.isSame = p.isEquivalent = objectStyleCF.equals
  p.splice2 = objectStyleCF.splice
  p.length = objectStyleCF.size
  
  p.names = function(){return _.map(this, function(item){return item.name()})}
  
  p.forEach = function(iterator, context){
    _A.each(this.attributeArray, function(attr, i){
      iterator.call(context, attr, i, this.attributeArray);
    })
  }
  
  p.spliceInNestedAttribute = function(nestedAttribute) {
    var firstNestedAttributePosition = _.indexesOf(this, nestedAttribute.nestedRelation().attributes()).sort()[0]
    var withoutAttributesToNest = _.differ(this, nestedAttribute.nestedRelation().attributes())
    return _.splice(withoutAttributesToNest, new F([nestedAttribute]), firstNestedAttributePosition)
  }
  
  p.splice = function(){ this.attributeArray.splice.apply(this.attributeArray, arguments)}
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