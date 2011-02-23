require("knit/engine/memory")

;(function(){
  var _ = knit._util

  //"toAlgorithm"...not quite right.  moving on for now.
  
  function newRelation(rows, name, attributes) {
    //curry?
    return new knit.engine.memory.Relation(name, attributes, [], rows, 0 + rows.length) 
  }

  function compile(relation) { return relation.defaultCompiler()(relation) }
  
  function getRows(relation) { return compile(relation).rows() }
  function getAttributes(relation) { return compile(relation).attributes() }

  knit.RelationReference.prototype.toAlgorithm = function() {
    var self = this
    return function(){return self}
  }
  
  knit.algebra.Project.prototype.toAlgorithm = function() {
    var self = this
    return function() {
      var originalAttributes = self.relation.attributes()
          keepAttributes = self.attributes(),
          rows = getRows(self.relation)
      var result = knit.algorithms.project({attributes:originalAttributes.fullyQualifiedNames(), 
                                            rows:rows}, 
                                           keepAttributes.fullyQualifiedNames())
      return newRelation(result.rows, self.relation.name(), keepAttributes)
    }
  }

  knit.algebra.Select.prototype.toAlgorithm = function() {
    var self = this
    return function() {
      var attributes = self.attributes(),
          rawPredicate = function(row) { return self.predicate.match(attributes, row) },
          result = knit.algorithms.select({attributes:attributes.names(), rows:getRows(self.relation)}, rawPredicate)
      return newRelation(result.rows, self.relation.name(), attributes)
    }
  }
    
    
  function join(relationOne, relationTwo, predicate, joinFunction, name) {
    var combinedAttributes = relationOne.attributes().concat(relationTwo.attributes()),
        rawPredicate = function(row) { return predicate.match(combinedAttributes, row) },
        result = 
          joinFunction(
            {attributes:relationOne.attributes().fullyQualifiedNames(), rows:getRows(relationOne)},
            {attributes:relationTwo.attributes().fullyQualifiedNames(), rows:getRows(relationTwo)},
            rawPredicate
          )
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
    var result = knit.algorithms.naturalJoin(
                   {attributes:self.relationOne.attributes().names(), rows:getRows(self.relationOne)},
                   {attributes:self.relationTwo.attributes().names(), rows:getRows(self.relationTwo)},
                   self.suffix)    
    return function() { 
      return newRelation(result.rows, self.name(), self.relationOne.attributes().concat(self.relationTwo.attributes())) 
    }
  }
  
  knit.algebra.Order.prototype.toAlgorithm = function() {
    var self = this
    return function() { 
      var orderFunction = self.direction == knit.algebra.Order.DESC ? knit.algorithms.orderDesc : knit.algorithms.orderAsc
      var result = orderFunction({attributes:self.attributes().fullyQualifiedNames(), rows:getRows(self.relation)}, self.orderAttribute.fullyQualifiedName())
      return newRelation(result.rows, self.relation.name(), self.relation.attributes()) 
    }
  }
  
  knit.algebra.Divide.prototype.toAlgorithm = function() {
    var self = this
    return function() {
      var result = knit.algorithms.divide(
        {attributes:self.dividend.attributes().fullyQualifiedNames(), rows:getRows(self.dividend)},
        {attributes:self.divisor.attributes().fullyQualifiedNames(), rows:getRows(self.divisor)}
      )

      return newRelation(result.rows, self.name(), self.dividend.attributes().differ(self.divisor.attributes()))
    }
  }
            
  knit.algebra.Unnest.prototype.toAlgorithm = function() {
    var self = this
    return function() {
      var result = knit.algorithms.unnest(
        {attributes:getAttributes(self.relation).fullyQualifiedNames(), rows:getRows(self.relation)}, 
        self.nestedAttribute.fullyQualifiedName()
      )
      
      var allAttributes = getAttributes(self.relation).concat(self.nestedAttribute.nestedRelation().attributes())
      return newRelation(result.rows, self.name(), allAttributes.fromPrimitives(result.attributes))
    }
  }
      
  knit.algebra.Nest.prototype.toAlgorithm = function() {
    //assumption: this relation is ordered by all non-nested attributes.  
    //note that for now this is guaranteed by nest.perform.
    var self = this
    return function() {
      var newAttributeArrangement = getAttributes(self.relation).spliceInNestedAttribute(self.nestedAttribute)
      var result = knit.algorithms.nest(
        {attributes:getAttributes(self.relation).fullyQualifiedNames(), rows:getRows(self.relation)}, 
        self.nestedAttribute.fullyQualifiedName(),
        newAttributeArrangement.fullyQualifiedNames()
      )
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
  
  
  
  // p.performLeftOuterJoin = function(relationTwo, predicate) {
  //   return this._join(relationTwo, predicate, knit.algorithms.leftOuterJoin)
  // }
  // 
  // p.performRightOuterJoin = function(relationTwo, predicate) {
  //   return this._join(relationTwo, predicate, knit.algorithms.rightOuterJoin)
  // }
  
  
  // knit.algebra.predicate.Conjunction.prototype.toSql = function(){ 
  // knit.algebra.predicate.Equality.prototype.toSql = function(){ 
  // knit.algebra.Order.prototype.toSql = ToSqlFunction(function(select){ 
  // knit.algebra.Join.prototype.toSql = ToSqlFunction(function(select){ 
  
})()
