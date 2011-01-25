require("knit/core")

//proh JEKT
knit.algebra.Project = function() {

  var F = function(relation, attributes) {
    this._attributes = attributes
    this.relation = relation
  }; var p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.perform = function() { return this.relation.perform().performProject(this.attributes()) }

  p.attributes = function(){ return this._attributes }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }

  p.isSame = p.isEquivalent = function(other) {
    return other.constructor == F && 
           this.relation.isSame(other.relation) &&
           _.isEqual(this.attributes(), other.attributes())
  }
  
  p.inspect = function(){return "project(" + this.relation.inspect() + "," + 
                                  "[" + _.map(this.attributes(), function(attr){return attr.inspect()}).join(",") + "])"}

  return F
}()


knit.dslLocals.project = function(relation, attributes) {
  return new knit.algebra.Project(relation, attributes)
}