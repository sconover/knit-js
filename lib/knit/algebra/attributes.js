require("knit/core")

knit.algebra.Attributes = function() {
  
  var F = function(attributeArray) {
    this._attributeArray = attributeArray
  }; var p = F.prototype

  var _A = CollectionFunctions.Array.functions
  
  var localCF = CollectionFunctions({
    iterator:function(attributes) { return _A.iterator(attributes._attributeArray)}, 
    nothing:function(){return null}, 
    equals:function(a,b){return a && b && a.isSame && b.isSame && a.isSame(b)},
    newCollection:function(){return new F([])},
    append:function(attributes, attribute){attributes._attributeArray.push(attribute)}
  })
  
  
  var _ = localCF.functions
  var objectStyleCF = localCF.makeObjectStyleFunctions(function(){return this})
  _A.each(["clone", "concat", "inspect", "without", "map",
           "each", "indexOf", "size", "differ", "empty", "indexOf", "indexesOf"], function(functionName) {
    p[functionName] = objectStyleCF[functionName]
  })
  p.isSame = p.isEquivalent = objectStyleCF.equals
  p.splice2 = objectStyleCF.splice
  
  p.names = function(){return _.pluck(this, 'name')}
  p.get = function() { 
    if (arguments.length==1) {
      var name = arguments[0]
      return _.detect(this, function(attr){return attr.name() == name}) 
    } else {
      var args = _A.toArray(arguments)
      return _.select(this, function(attr){return _A.include(args, attr.name())}) 
    }
  }
  
  p.forEach = function(iterator, context){
    _A.each(this._attributeArray, function(attr, i){
      iterator.call(context, attr, i, this._attributeArray);
    })
  }
  
  p.spliceInNestedAttribute = function(nestedAttribute) {
    var firstNestedAttributePosition = _.indexesOf(this, nestedAttribute.nestedRelation().attributes()).sort()[0]
    var withoutAttributesToNest = _.differ(this, nestedAttribute.nestedRelation().attributes())
    return _.splice(withoutAttributesToNest, new F([nestedAttribute]), firstNestedAttributePosition)
  }
  
  p.splice = function(){ this._attributeArray.splice.apply(this._attributeArray, arguments)}
  p.toArray = function(){ return _A.clone(this._attributeArray)}
  
  p.makeObjectFromRow = function(row) {
    var object = {}
    _.each(this, function(attr, columnPosition) {
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