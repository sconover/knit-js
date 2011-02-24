require("knit/core")

TestRelation = function() {
  var _ = knit._util,
      _id = 0,
      F = function(attributeNamesAndTypes) {
            _id += 1
            this._id = "test_" + _id
            var self = this
    
            if (attributeNamesAndTypes.constructor == knit.Attributes) {
              this._attributes = attributeNamesAndTypes
            } else {
              this._attributes = new knit.Attributes(
                _.map(attributeNamesAndTypes, function(nameAndType){
                  // if (typeof nameAndType == "string") console.log(nameAndType)
          
                  if (nameAndType.name) {
                    return nameAndType
                  } else if (nameAndType.length && nameAndType.length==2) {
                    var attributeName = nameAndType[0]
                    var attributeType = nameAndType[1]
                    return new TestAttribute(attributeName, attributeType, self)
                  } else {
                    var attributeName = _.keys(nameAndType)[0]
                    var nestedRelation = _.values(nameAndType)[0]
                    return new TestNestedAttribute(attributeName, nestedRelation, self)
                  }      
                })
              )
            }
    
          },
      p = F.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.id = function(){ return this._id }
  p.attributes = function(){ return this._attributes }
  p.attr = function(attributeName) { return this.attributes().get(attributeName) }
  p.isSame = function(other) { return other.id && this.id() == other.id() }
  
  p.isEquivalent = function(other) {
    return knit.quacksLike(other, knit.signature.relation) &&
           this.attributes().isSame(other.attributes())
  }
  
  p.newNestedAttribute = function(attributeName, attributesToNest) {
    var nestedRelation = new TestRelation([]) 
    nestedRelation._attributes = attributesToNest
    return new TestNestedAttribute(attributeName, nestedRelation, this)
  }
  
  p.inspect = function() { return "r[" + this.attributes().inspect() + "]" }

  return F
}()

TestAttribute = function() {
  var F = function(name, type, sourceRelation) {
        this._name = name
        this._type = type
        this._sourceRelation = sourceRelation
      },
      p = F.prototype

  p.name = 
    p.structuredName = function() { return this._name }
  p.fullyQualifiedName = function() { return this.sourceRelation().id() + "." + this.name() }
  p.type = function() { return this._type }
  p.sourceRelation = function() { return this._sourceRelation }
  p.isSame = 
    p.isEquivalent = function(other) {
      return knit.quacksLike(other, knit.signature.attribute) &&
             this.name() == other.name() &&
             this.sourceRelation().id() == other.sourceRelation().id()
    }
  
  p.inspect = function() { return this.name() }
  
  return F
}()

TestNestedAttribute = function() {
  var F = function(name, nestedRelation, sourceRelation) {
        this._name = name
        this._nestedRelation = nestedRelation
        this._sourceRelation = sourceRelation
      },
      p = F.prototype
  
  p.name = 
    p.structuredName = function() { return this._name }
  p.fullyQualifiedName = function() { return this.sourceRelation().id() + "." + this.name() }
  p.type = function() { return knit.attributeType.Nested }
  p.sourceRelation = function() { return this._sourceRelation }
  p.nestedRelation = function() { return this._nestedRelation }
  p.isSame = 
    p.isEquivalent = function(other) {
      return knit.quacksLike(other, knit.signature.nestedAttribute) &&
             this.name() == other.name() &&
             this.sourceRelation().id() == other.sourceRelation().id() &&
             this.sourceRelation().id() == other.sourceRelation().id()
    }

  p.inspect = function() { return this.name() + ":" + this.nestedRelation().inspect() }
  
  return F
}()
