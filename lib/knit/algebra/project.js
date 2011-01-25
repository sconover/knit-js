require("knit/core")

//proh JEKT
knit.algebra.Project = function() {

  var F = function(relation, attributes) {
    this._attributes = attributes
    this.relation = relation
  }
  
  knit.mixin.RowsAndObjects(F.prototype)
  
  F.prototype.perform = function() {
    return this.relation.perform().performProject(this.attributes())
  }

  F.prototype.attributes = function(){ return this._attributes }
  
  F.prototype.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }

  F.prototype.isSame = function(other) {
    return other.constructor == F && 
           this.relation.isSame(other.relation) &&
           _.isEqual(this.attributes(), other.attributes())
  }
  F.prototype.isEquivalent = F.prototype.isSame
  
  F.prototype.inspect = function(){return "project(" + this.relation.inspect() + "," + 
                                          "[" + _.map(this.attributes(), function(attr){return attr.inspect()}).join(",") + "])"}

  return F
}()


knit.dslLocals.project = function(relation, attributes) {
  return new knit.algebra.Project(relation, attributes)
}