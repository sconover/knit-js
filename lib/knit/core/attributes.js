knit.Attributes = function() {

  var _ = knit._util,
      F = function(attributeArray) {
            this._attributeArray = attributeArray
          },
      p = F.prototype,
      localCF = CollectionFunctions({
        iterator:function(attributes) { return _.iterator(attributes._attributeArray)}, 
        nothing:function(){return null}, 
        equals:function(a,b){return a && b && a.isSame && b.isSame && a.isSame(b)},
        newCollection:function(){return new F([])},
        append:function(attributes, attribute){attributes._attributeArray.push(attribute)}
      }),
      _O = localCF.functions,
      objectStyleCF = localCF.makeObjectStyleFunctions(function(){return this})

  _.each(["clone", "concat", "inspect", "without", "map",
           "each", "indexOf", "size", "differ", "empty", "indexOf", "indexesOf"], function(functionName) {
    p[functionName] = objectStyleCF[functionName]
  })
  p.isSame = 
    p.isEquivalent = objectStyleCF.equals
  p.splice = objectStyleCF.splice
  
  p.names = function(){return _O.pluck(this, 'name')}
  p.types = function(){return _O.pluck(this, 'type')}
  p.namesAndTypes = function(){return _O.map(this, function(attr){return [attr.name(),attr.type()]})}
  p.get = function() { 
    if (arguments.length==1) {
      var name = arguments[0]
      return _O.detect(this, function(attr){return attr.name() == name}) 
    } else {
      var args = _.toArray(arguments)
      return _O.select(this, function(attr){return _.include(args, attr.name())}) 
    }
  }
  
  p.spliceInNestedAttribute = function(nestedAttribute) {
    var firstNestedAttributePosition = _O.indexesOf(this, nestedAttribute.nestedRelation().attributes()).sort()[0]
    var withoutAttributesToNest = _O.differ(this, nestedAttribute.nestedRelation().attributes())
    return _O.splice(withoutAttributesToNest, new F([nestedAttribute]), firstNestedAttributePosition)
  }
  
  p.wrapWithOrderBy = function(relation, direction) {
    var result = relation
    _O.each(this, function(orderByAttr){
      result = new knit.algebra.Order(relation, orderByAttr, knit.algebra.Order.ASC)
    })
    return result
  }
  
  p.makeObjectFromRow = function(row) {
    var object = {}
    _O.each(this, function(attr, columnPosition) {
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