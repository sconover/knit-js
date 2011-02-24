require("knit/core")

knit.algebra.RenameRelation = function() {

  var _ = knit._util,
      F = function(relation, alias) {
            this.relation = relation
            this.alias = alias
          },
      p = F.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.attributes = function(){ return this.relation.attributes() }
  p.attr = function() { return this.relation.attributes().get(_.toArray(arguments)) }
  
  p.newNestedAttribute = function() { return this.relation.newNestedAttribute.apply(this.relation, arguments) }

  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == F && 
             this.relation.isSame(other.relation) &&
             this.alias == other.alias
    }
  
  p.inspect = function(){return "rename(" + this.relation.inspect() + "," + this.alias + ")"}

  return F
}()

knit.algebra.RenameAttribute = function() {

  var F = function(attribute, alias) {
            this.attribute = attribute
            this.alias = alias
          },
      p = F.prototype
  
  p.name = function(){ return this.alias }
  p.type = function(){ return this.attribute.type() }
  p.sourceRelation = function(){ return this.attribute.sourceRelation() }

  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == F && 
             this.attribute.isSame(other.attribute) &&
             this.alias == other.alias
    }
  
  p.inspect = function(){return "#" + this.alias}

  return F
}()


knit.createBuilderFunction.dslLocals.rename = function(thing, alias) {
  if (knit.quacksLike(thing, knit.signature.relation)) {
    return new knit.algebra.RenameRelation(thing, alias)
  } else {
    return new knit.algebra.RenameAttribute(thing, alias)
  }
}