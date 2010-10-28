require("knit/core")
require("knit/attribute")

knit.TestRelationFunction = function(attrDefs) {
  this.attributes = _.map(attrDefs, function(attrDef){
    return new knit.Attribute(attrDef[0], attrDef[1])
  })
}

_.extend(knit.TestRelationFunction.prototype, {
  attr: function(attributeName) {
    return _.detect(this.attributes, function(attr){return attr.name() == attributeName})
  },
  
  isSame: function(other) {
    var zipped = _.zip(this.attributes, other.attributes)
    var result = _.uniq(_.map(zipped, function(row){return _.compact(row).length==2 && row[0].isSame(row[1])}))
    return _.isEqual(result, [true])
  },
  
  split: function(){return this},
  merge: function(){return this},

  
  inspect: function() {
    return "r[" + 
           _.map(this.attributes, function(attr){return attr.name()}).join(",") + 
           "]" 
  }

})

knit.TestRelationFunction.prototype.isEquivalent = knit.TestRelationFunction.prototype.isSame

knit.locals.testRelation = function(attrDefs) {
  return new knit.TestRelationFunction(attrDefs)
}