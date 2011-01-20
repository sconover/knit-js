require("knit/core")

knit.algebra.Project = function(relation, attributes) {
  this._attributes = attributes
  this.relation = relation
  
  this.newNestedAttribute = this.relation.newNestedAttribute
}

_.extend(knit.algebra.Project.prototype, {
  attributes: function(){ return this._attributes },
  
  isSame: function(other) {
    return other instanceof knit.algebra.Project && 
           this.relation.isSame(other.relation) &&
           _.isEqual(this.attributes(), other.attributes())
  },
  
  inspect: function(){return "project(" + this.relation.inspect() + "," + 
                                          "[" + _.map(this.attributes(), function(attr){return attr.inspect()}).join(",") + "])"}
})

knit.algebra.Project.prototype.isEquivalent = knit.algebra.Project.prototype.isSame

knit.dslLocals.project = function(relation, attributes) {
  return new knit.algebra.Project(relation, attributes)
}