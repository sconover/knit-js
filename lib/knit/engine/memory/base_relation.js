require("knit/use_algorithms")
require("vendor/jshashtable")
require("vendor/jshashset")

knit.engine.memory.BaseRelation = (function() {
  
  var _ = knit._util,
      _id = 0,
      C = function(name, attributeNamesAndTypes, primaryKey, rows, costSoFar) {
            _id += 1
            this._id = "memory_" + _id + "_" + name
            this._name = name
            var self = this

            if (attributeNamesAndTypes.constructor == knit.Attributes) {
              this._attributes = attributeNamesAndTypes //confusingly enough...
            } else {
              var attributes = []
              _.each(attributeNamesAndTypes, function(nameAndType){
                var attrToAdd = null
                if (nameAndType.name) {
                  attrToAdd = nameAndType
                } else if (nameAndType.push) {
                  var attributeName = nameAndType[0],
                      attributeType = nameAndType[1]
                  attrToAdd = new knit.engine.memory.Attribute(attributeName, attributeType, self)
                } else {
                  var nestedAttributeName = _.keys(nameAndType)[0],
                      nestedRelation = _.values(nameAndType)[0]
                  attrToAdd = new knit.engine.memory.NestedAttribute(nestedAttributeName, nestedRelation, self)
                }

                attributes.push(attrToAdd)
              })      
              this._attributes = new knit.Attributes(attributes)
            }

            this._pkAttributeNames = primaryKey || []
            var pkPositions = _.indexesOf(this._attributes.names(), this._pkAttributeNames)
            
            this._rowStore = 
              new HashSet(function(row){return 1 /* compare every object, always.  inefficient for now. */}, 
                          function(aRow,bRow){
                            return _.empty(pkPositions) ? 
                              false : 
                              _.deepEqual(_.get(aRow, pkPositions), _.get(bRow, pkPositions))})
            this._rowStore.addAll(rows || [])
            this._cost = costSoFar || 0
          },
      p = C.prototype
      
  knit.mixin.relationDefaults(p)
  
  p.defaultCompiler = function() { return knit.UseAlgorithms.expressionCompiler() }
  
  p.id = function(){ return this._id }
  p.name = function(){ return this._name }
  p.cost = function(){ return this._cost }
  p.attributes = function(){ return this._attributes }
  p.attr = function() { return this.attributes().get(_.toArray(arguments)) }
  p.rows = function() { 
    var pkPositions = _.indexesOf(this._attributes.names(), this._pkAttributeNames)
    return _.empty(pkPositions) ? 
            this._rowStore.values() : 
            _.sort(this._rowStore.values(), function(aRow, bRow){
              var allLessThan = !(_.detect(pkPositions, function(position){return aRow[position] > bRow[position]}))
              return allLessThan ? 1 : -1
            })
  }
  
  p.isSame = function(other) { return other.id && this.id() == other.id() }
  p.isEquivalent = function(other) {
    return _.quacksLike(other, knit.signature.relation) &&
           this.attributes().isEquivalent(other.attributes())
  }
  
  p.inspect = function() { return this.name() + "[" + this.attributes().inspect() + "]" }
  
  
  p.newNestedAttribute = function(attributeName, attributesToNest) {
    var nestedRelation = new C("(nested)", attributesToNest, [], [], 0) 
    return new knit.engine.memory.NestedAttribute(attributeName, nestedRelation, this)
  }

  return C
})()

knit.engine.memory.MutableBaseRelation = function(name, attributeNamesAndTypes, primaryKey) {
  
  var result = new knit.engine.memory.BaseRelation(name, attributeNamesAndTypes, primaryKey)
  knit._util.extend(result, {
    merge: function(rowsToAdd) {
      this._rowStore.addAll(rowsToAdd)
      return this
    }
  })
  return result
}
