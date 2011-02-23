require("knit/engine/memory")

;(function(){
  var _ = knit._util

  function newRelation(rows, name, attributes) {
    return new knit.engine.memory.Relation(name, attributes, [], rows, 0 + rows.length) 
  }

  function compile(relation) { return relation.defaultCompiler()(relation) }  
  function getAttributes(relation) { return compile(relation).attributes() }
  
  function toRawRelation(relation) {
    var compiled = compile(relation)
    return {name:compiled.name(), attributes:compiled.attributes().fullyQualifiedNames(), rows:compiled.rows()}
  }

  function toRawAttributes(attrs) { return attrs.fullyQualifiedNames() }
  
  knit.RelationReference.prototype.toAlgorithm = function() {
    var self = this
    return function(){return self}
  }
  
  knit.algebra.Project.prototype.toAlgorithm = function() {
    var self = this
    return function() {
      var rawRelation = toRawRelation(self.relation),
          keepAttributes = self.attributes(),
          result = knit.algorithms.project(rawRelation, toRawAttributes(keepAttributes))
      return newRelation(result.rows, rawRelation.name, keepAttributes)
    }
  }

  knit.algebra.Select.prototype.toAlgorithm = function() {
    var self = this
    return function() {
      var rawRelation = toRawRelation(self.relation),
          attributes = self.attributes(),
          rawPredicate = function(row) { return self.predicate.match(attributes, row) },
          result = knit.algorithms.select(rawRelation, rawPredicate)
      return newRelation(result.rows, rawRelation.name, self.attributes())
    }
  }
    
    
  function join(relationOne, relationTwo, predicate, joinFunction, name) {
    var rawRelationOne = toRawRelation(relationOne),
        rawRelationTwo = toRawRelation(relationTwo),
        combinedAttributes = relationOne.attributes().concat(relationTwo.attributes()),
        rawPredicate = function(row) { return predicate.match(combinedAttributes, row) },
        result = joinFunction(rawRelationOne, rawRelationTwo, rawPredicate)
    return newRelation(result.rows, name, combinedAttributes) 
  }
    
  knit.algebra.Join.prototype.toAlgorithm = function() {
    var self = this
    return function() { return join(self.relationOne, self.relationTwo, self.predicate, 
                                    knit.algorithms.join, self.name()) }
  }
  
  knit.algebra.LeftOuterJoin.prototype.toAlgorithm = function() {
    var self = this
    return function() { return join(self.relationOne, self.relationTwo, self.predicate, 
                                    knit.algorithms.leftOuterJoin, self.name()) }
  }
  
  knit.algebra.RightOuterJoin.prototype.toAlgorithm = function() {
    var self = this
    return function() { return join(self.relationOne, self.relationTwo, self.predicate, 
                                    knit.algorithms.rightOuterJoin, self.name()) }
  }
  
  knit.algebra.NaturalJoin.prototype.toAlgorithm = function() {
    var self = this
    return function() { 
      var combinedAttributes = self.relationOne.attributes().concat(self.relationTwo.attributes()),
          rawRelationOne = toRawRelation(self.relationOne),
          rawRelationTwo = toRawRelation(self.relationTwo),
          result = knit.algorithms.naturalJoin(rawRelationOne, rawRelationTwo, self.suffix)
      return newRelation(result.rows, self.name(), combinedAttributes) 
    }
  }
  
  knit.algebra.Order.prototype.toAlgorithm = function() {
    var self = this
    return function() { 
      var orderFunction = self.direction == knit.algebra.Order.DESC ? 
                            knit.algorithms.orderDesc : 
                            knit.algorithms.orderAsc,
          rawRelation = toRawRelation(self.relation),
          result = orderFunction(rawRelation, self.orderAttribute.fullyQualifiedName())
      return newRelation(result.rows, rawRelation.name, getAttributes(self.relation)) 
    }
  }
  
  knit.algebra.Divide.prototype.toAlgorithm = function() {
    var self = this
    return function() {
      var rawDidvendRelation = toRawRelation(self.dividend),
          rawDivisorRelation = toRawRelation(self.divisor),
          result = knit.algorithms.divide(rawDidvendRelation, rawDivisorRelation),
          quotientAttributes = self.dividend.attributes().differ(self.divisor.attributes())
      return newRelation(result.rows, self.name(), quotientAttributes)
    }
  }
            
  knit.algebra.Unnest.prototype.toAlgorithm = function() {
    var self = this
    return function() {
      var rawRelation = toRawRelation(self.relation),
          result = knit.algorithms.unnest(rawRelation, self.nestedAttribute.fullyQualifiedName()),
          allAttributes = getAttributes(self.relation).concat(getAttributes(self.nestedAttribute.nestedRelation()))
      return newRelation(result.rows, self.name(), allAttributes.fromPrimitives(result.attributes))
    }
  }
      
  knit.algebra.Nest.prototype.toAlgorithm = function() {
    //assumption: this relation is ordered by all non-nested attributes.  
    //note that for now this is guaranteed by nest.perform.
    var self = this
    return function() {
      var newAttributeArrangement = getAttributes(self.relation).spliceInNestedAttribute(self.nestedAttribute),
          rawRelation = toRawRelation(self.relation),
          result = knit.algorithms.nest(rawRelation, 
                                        self.nestedAttribute.fullyQualifiedName(), 
                                        newAttributeArrangement.fullyQualifiedNames())
      return newRelation(result.rows, self.name(), newAttributeArrangement)
    }
  }
  
      
      
  //this name business needs to be thought through

  knit.algebra.Select.prototype.name = 
    knit.algebra.Project.prototype.name = 
    knit.algebra.Nest.prototype.name = 
    knit.algebra.Unnest.prototype.name = function() {
    return this.relation.name()
  }
  
  knit.algebra.Join.prototype.name =
    knit.algebra.LeftOuterJoin.prototype.name =
    knit.algebra.RightOuterJoin.prototype.name =
    knit.algebra.NaturalJoin.prototype.name = function() {
    return this.relationOne.name() + "__" + this.relationTwo.name()
  }
  
  knit.algebra.Divide.prototype.name = function() {
    return this.dividend.name() + "$$" + this.divisor.name()
  }
  
  
})()