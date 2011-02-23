require("knit/use_algorithms")
knit.engine.memory.Relation = function() {
  var _ = knit._util,
      _id = 0,
      F = function(name, attributeNamesAndTypes, primaryKey, rows, costSoFar) {
            _id += 1
            this._id = "memory_" + _id + "_" + name
            this._name = name
            var self = this

            if (attributeNamesAndTypes.constructor == knit.Attributes) {
              this._attributes = attributeNamesAndTypes //confusingly enough...
            } else {
              var attributes = [],
                  self = this
              _.each(attributeNamesAndTypes, function(nameAndType){
                var attrToAdd = null
                if (nameAndType.name) {
                  attrToAdd = nameAndType
                } else if (nameAndType.push) {
                  var attributeName = nameAndType[0],
                      attributeType = nameAndType[1]
                  attrToAdd = new knit.engine.memory.Attribute(attributeName, attributeType, self)
                } else {
                  var attributeName = _.keys(nameAndType)[0],
                      nestedRelation = _.values(nameAndType)[0]
                  attrToAdd = new knit.engine.memory.NestedAttribute(attributeName, nestedRelation, self)
                }

                attributes.push(attrToAdd)
              })      
              this._attributes = new knit.Attributes(attributes)
            }

            this._pkAttributeNames = primaryKey || []
            var pkPositions = _.indexesOf(this._attributes.names(), this._pkAttributeNames)

            this._rowStore = new knit.engine.memory.StandardRowStore(pkPositions, rows || [])
            this._cost = costSoFar || 0
          },
      p = F.prototype

  p.id = function(){ return this._id }
  p.name = function(){ return this._name }
  p.cost = function(){ return this._cost }
  p.compile = function(){ return this }
  p.attributes = function(){ return this._attributes }
  p.attr = function() { return this.attributes().get(_.toArray(arguments)) }
  p.split = 
    p.merge = function(){return this}
  p.rows = function() { return this._rowStore.rows() }
  p.objects = function(rows) {
    rows = rows || this.rows()
    var attributes = this.attributes()
    return _.map(rows, function(row){return attributes.makeObjectFromRow(row)})
  }
  
  p.isSame = function(other) { return other.id && this.id() == other.id() }
  p.isEquivalent = function(other) {
    return knit.quacksLike(other, knit.signature.relation) &&
           this.attributes().isEquivalent(other.attributes())
  }
  
  p.inspect = function() { return this.name() + "[" + this.attributes().inspect() + "]" }
  
  
  p._newRelation = function(rows, name, attributes) {
    var newName = name || this.name(),
        newAttributes = attributes || this.attributes()
    
    //curry?
    return new knit.engine.memory.Relation(newName, newAttributes, this._pkAttributeNames, rows, this.cost + rows.length) 
  }
  
  p.newNestedAttribute = function(attributeName, attributesToNest) {
    var nestedRelation = new knit.engine.memory.Relation("(nested)", attributesToNest, [], [], 0) 
    return new knit.engine.memory.NestedAttribute(attributeName, nestedRelation, this)
  }

  p.defaultCompiler = function() { return knit.UseAlgorithms.expressionCompiler() }

  p.toAlgorithm = function() {
    var self = this
    return function(){return self}
  }

  return F
}()

knit.engine.memory.MutableRelation = function(name, attributeNamesAndTypes, primaryKey) {
  var result = new knit.engine.memory.Relation(name, attributeNamesAndTypes, primaryKey)
  knit._util.extend(result, {
    merge: function(rowsToAdd) {
      this._rowStore.merge(rowsToAdd)
      return this
    }
  })
  return result
}
