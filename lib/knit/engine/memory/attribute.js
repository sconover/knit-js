knit.engine.memory.Attribute = function(){

  var C = function(name, type, sourceRelation) {
            this._name = name
            this._sourceRelation = sourceRelation
          },
      p = C.prototype

  p.name = 
    p.structuredName = function() { return this._name }
  p.fullyQualifiedName = function() { return this.sourceRelation().name() + "." + this.name() }
  p.type = function() { }
  p.sourceRelation = function() { return this._sourceRelation }
  p.isSame = 
    p.isEquivalent = function(other) {
      return knit.quacksLike(other, knit.signature.attribute) &&
             this.name() == other.name() &&
             this.sourceRelation().id() == other.sourceRelation().id()
    }
  
  p.inspect = function() { return this.name() }
  
  return C
}()

knit.engine.memory.NestedAttribute = function(){

  var C = function(name, nestedRelation, sourceRelation) {
            this._name = name
            this._nestedRelation = nestedRelation
            this._sourceRelation = sourceRelation
          },
      p = C.prototype
  
  p.name = function() { return this._name }
  p.structuredName = function() { 
    var result = {}
    result[this.name()] = this.nestedRelation().attributes().structuredNames()
    return result
  }
  p.fullyQualifiedName = function() { 
    var result = {}
    result[this.name()] = this.nestedRelation().attributes().fullyQualifiedNames()
    return result
  }
  p.type = function() { return knit.attributeType.Nested }
  p.sourceRelation = function() { return this._sourceRelation }
  p.nestedRelation = function() { return this._nestedRelation }
  p.isSame = 
    p.isEquivalent = function(other) {
      return knit.quacksLike(other, knit.signature.nestedAttribute) &&
             this.name() == other.name() &&
             this.nestedRelation().id() == other.nestedRelation().id()
    }
  
  p.inspect = function() {
    return this.name() + ":" + this.nestedRelation().inspect()
  }
  
  return C
}()
