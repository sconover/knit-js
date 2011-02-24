require("knit/core")

//proh JEKT
knit.algebra.Project = function() {

  var C = function(relation, attributes) {
            this._attributes = attributes
            this.relation = relation
          },
      p = C.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.defaultCompiler = function() { return this.relation.defaultCompiler() }
  p.attributes = function(){ return this._attributes }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }

  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == C && 
             this.relation.isSame(other.relation) &&
             this.attributes().isSame(other.attributes())
    }
  
  p.inspect = function(){return "project(" + this.relation.inspect() + "," + 
                                        "[" + this.attributes().inspect() + "])"}

  return C
}()


knit.createBuilderFunction.dslLocals.project = function(relation, attributes) {
  return new knit.algebra.Project(relation, new knit.Attributes(attributes))
}