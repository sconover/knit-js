

//knit/algebra ======================================================
//hrm.  inelegant.


//knit/core ======================================================
if (!(typeof window === 'undefined')) global=window

global.knit = {
  algebra: {predicate:{}},
  mixin:{},
  engine:{  /*hrm.  begone.*/ sql:{statement:{}}  }
}



//knit/util ======================================================
knit.indexOfSame = function(things, thing) {
  var index = null
  for(var i=0; i<things.length; i++) {
    if (things[i].isSame(thing)) {
      index = i
      break
    }
  }
  return index
}

//see http://javascript.crockford.com/prototypal.html
knit.createObject = function() {
  var o = arguments[0]

  function __F() {}
  __F.prototype = o
  var newObj = new __F()

  if (arguments.length==2) {
    var additions = arguments[1]
    _.extend(newObj, additions)
  }

  return newObj
}



//knit/quacks_like ======================================================

//see http://fitzgeraldnick.com/weblog/39/

knit.quacksLike = function(object, signature) {
  if (typeof signature === "undefined") throw("no signature provided")
  
  var k, ctor;
  for ( k in signature ) {
    ctor = signature[k];
    if ( ctor === Number ) {
      if ( Object.prototype.toString.call(object[k]) !== "[object Number]"
           || isNaN(object[k]) ) {
        return false;
      }
    } else if ( ctor === String ) {
      if ( Object.prototype.toString.call(object[k])
           !== "[object String]" ) {
        return false;
      }
    } else if ( ctor === Boolean ) {
      var value = object[k]
      if (!(value === true || value === false)) return false
    } else if ( ! (object[k] instanceof ctor) ) {
      return false;
    }
  }
  return true;
};


//knit/reference ======================================================

knit.RelationReference = function(){
  var F = function(relationName) {
    this._relation = new knit.UnresolvedRelationReference(relationName)
  }; var p = F.prototype
  
  p.resolve = function(bindings) { 
    if (this._relation.resolve) this._relation = this._relation.resolve(bindings) 
    return this
  }
  
  _.each(["id", "attributes", "attr", "inspect", "merge", "split", "newNestedAttribute", "perform"], function(methodNameToDelegate) {
    p[methodNameToDelegate] = function() { 
      return this._relation[methodNameToDelegate].apply(this._relation, arguments) 
    }
  })
  
  p.isSame = p.isEquivalent = function(other) { 
    return this._relation.isSame(other) || !!(other._relation && this._relation.isSame(other._relation))
  }
  
  return F
}()

knit.UnresolvedRelationReference = function(){
  var _id = 0
  
  var F = function(relationName) {
    this._relationName = relationName
    _id += 1
    this._id = "unresolvedRelation_" + _id
  }; var p = F.prototype
  
  p.id = function(bindings) { return this._id }
  p.resolve = function(bindings) { return bindings[this._relationName] }

  _.each(["attributes", "attr", "merge", "split", "newNestedAttribute", "perform"], function(methodNameToDelegate) {
    p[methodNameToDelegate] = function() { 
      throw(methodNameToDelegate + " not available until after resolve (and refs are bound to real relations)")
    }
  })
  
  p.isSame = p.isEquivalent = function(other) {
    return other.constructor == F &&
           this._relationName == other._relationName
  }
  
  p.inspect = function(){return "*" + this._relationName }
  
  return F
}()

knit.NullRelation = function(){
  var F = function() {}; var p = F.prototype
  p.resolve = function(bindings) { return this }
  p.id = function() { return "nullRelation_id" }
  p.attributes = function() { return [] }
  p.attr = function() { throw("Null Relation has no attributes") }
  p.inspect = function() { return "nullRelation" }
  p.merge = function() { return this }
  p.split = function() { return this }
  p.newNestedAttribute = function() { throw("It doesn't make sense for Null Relation to create attributes") }
  p.perform = function() { return this }
  p.isSame = p.isEquivalent = function(other) { return this === other }
  return new F()  
}()

knit.AttributeReference = function(){
  var F = function(relationRef, attributeName) {
    this._attribute = new knit.UnresolvedAttributeReference(relationRef, attributeName)
  }; var p = F.prototype
  
  p.resolve = function(bindings) { 
    if (this._attribute.resolve) this._attribute = this._attribute.resolve(bindings) 
    return this
  }
  
  p.name = function() { return this._attribute.name() }
  p.sourceRelation = function() { return this._attribute.sourceRelation() }

  p.isSame = p.isEquivalent = function(other) { 
    return this._attribute.isSame(other)
  }
  
  p.inspect = function(){return this._attribute.inspect()}
  
  return F
}()

knit.UnresolvedAttributeReference = function(){
  var F = function(relationRef, attributeName) {
    this._relationRef = relationRef
    this._attributeName = attributeName
  }; var p = F.prototype
  
  p.resolve = function(bindings) {
    return this._relationRef.resolve(bindings).attr(this._attributeName)
  }

  p.name = function() { return this._attributeName }
  p.sourceRelation = function() { return this._relationRef }
  
  p.isSame = p.isEquivalent = function(other) {
    return knit.quacksLike(other, knit.signature.attribute) &&
           this.sourceRelation().isSame(other.sourceRelation()) &&
           this.name() == other.name()
  }
  
  p.inspect = function(){return "*" + this._attributeName}
  
  return F
}()

knit.NestedAttributeReference = function(){
  
  var F = function(attributeName, nestedAttributes) {
    this._attribute = new knit.UnresolvedNestedAttributeReference(attributeName, nestedAttributes)
  }; var p = F.prototype
  
  p.resolve = function(bindings) { 
    if (this._attribute.resolve)  this._attribute = this._attribute.resolve(bindings) 
    return this
  }
  
  p.name = function() { return this._attribute.name() }
  p.setSourceRelation = function(sourceRelation) { return this._attribute.setSourceRelation(sourceRelation) }
  p.sourceRelation = function() { return this._attribute.sourceRelation() }
  p.nestedRelation = function() { return this._attribute.nestedRelation() }
  
  p.isSame = p.isEquivalent = function(other) {
    return knit.quacksLike(other, knit.signature.attribute) &&
           this._attribute.isSame(other)
  }
  
  p.inspect = function(){return this._attribute.inspect()}
  
  return F
}()

knit.UnresolvedNestedAttributeReference = function(){
  var F = function(attributeName, nestedAttributes) {
    this._attributeName = attributeName
    this._nestedAttributes = nestedAttributes
    this._sourceRelation = knit.NullRelation
  }; var p = F.prototype

  p.resolve = function(bindings) { 
    _.each(this._nestedAttributes, function(nestedAttribute){nestedAttribute.resolve(bindings)})
    return this.sourceRelation().newNestedAttribute(this._attributeName, this._nestedAttributes)
  }
  
  p.name = function() { return this._attributeName }
  p.sourceRelation = function() { return this._sourceRelation }
  p.setSourceRelation = function(sourceRelation) { this._sourceRelation = sourceRelation; return this }
  p.nestedRelation = function() { throw("nestedRelation is not available until after resolve") }
  
  p.isSame = p.isEquivalent = function(other) {
    return knit.quacksLike(other, knit.signature.attribute) &&
           this.sourceRelation().isSame(other.sourceRelation()) &&
           this.name() == other.name()
  }
  
  p.inspect = function(){return "*" + this._attributeName}
  
  return F
}()


knit.ReferenceEnvironment = function(){
  var F = function() {
    this._keyToRef = {}
  }; var p = F.prototype
  
  p.relation = function(relationName) {
    var relationRef = this._keyToRef[relationName] = this._keyToRef[relationName] || new knit.RelationReference(relationName)
    return relationRef
  }
  
  function regularAttr(relationNameDotAttributeName) {
    var key = relationNameDotAttributeName
    var parts = relationNameDotAttributeName.split(".")
    var relationRef = this.relation(parts[0])
    var attributeName = parts[1]
    var attributeRef = this._keyToRef[key] = this._keyToRef[key] || new knit.AttributeReference(relationRef, attributeName)
    return attributeRef
  }
  
  function nestedAttr(attributeName, nestedAttributeRefs) {
    var key = attributeName
    var attributeRef = this._keyToRef[key] = this._keyToRef[key] || new knit.NestedAttributeReference(attributeName, nestedAttributeRefs)
    return attributeRef
  }
  
  p.attr = function() {
    var args = _.toArray(arguments)
    
    if (args.length == 1) {
      var relationNameDotAttributeName = args[0]
      return _.bind(regularAttr, this)(relationNameDotAttributeName)
    } else if (args.length==2 && _.isArray(args[1]) ){
      var attributeName = args[0]
      var nestedAttributeRefs = args[1]
      return _.bind(nestedAttr, this)(attributeName, nestedAttributeRefs)
    } else {
      var self = this
      return _.map(args, function(relationNameDotAttributeName){return self.attr(relationNameDotAttributeName)})
    }
  }
  
  p.resolve = function(bindings) {
    var self = this
    
    var resolved = []
    _.each(_.keys(bindings), function(relationKey){
      
      self.relation(relationKey).resolve(bindings)
      resolved.push(relationKey)
      
      _.each(bindings[relationKey].attributes(), function(attribute){
        var attributeKey = relationKey + "." + attribute.name()
        self.attr(attributeKey).resolve(bindings)
        resolved.push(attributeKey)
      })
    })
    
    var stillToResolve = _.without.apply(null, [_.keys(this._keyToRef)].concat(resolved))
    _.each(stillToResolve, function(key){
      self._keyToRef[key].resolve(bindings)
    })
    
    return this
  }
  
  p.decorate = function(target, bindings) {
    target.relation = _.bind(this.relation, this)
    target.attr = _.bind(this.attr, this)
    var resolveF = _.bind(this.resolve, this)
    target.resolve = function(){resolveF(bindings())}
    return target
  }
  
  return F
}()


//knit/signatures ======================================================
knit.signature = function(){
  var like = {
    isSame:Function, 
    isEquivalent:Function
  }
  
  var signatures = {}
  
  signatures.attribute = _.extend({
    name:Function, 
    sourceRelation:Function}, 
    like
  )
  
  signatures.nestedAttribute = _.extend({
    nestedRelation:Function}, 
    signatures.attribute
  )
  
  signatures.relation = _.extend({
    attributes:Function, 
    split:Function, 
    merge:Function, 
    newNestedAttribute:Function}, 
    like
  )
  
  signatures.join = _.extend({
    relationOne:Object, 
    relationTwo:Object, 
    predicate:Object}, 
    signatures.relation
  )

  return signatures
}()



//knit/dsl_function ======================================================
//see http://alexyoung.org/2009/10/22/javascript-dsl/

global.DSLFunction = (function() {
  var dslLocals = {}
  var outerFunction = function(userFunction, what_theKeywordThis_IsSupposedToBe){
    if (what_theKeywordThis_IsSupposedToBe == undefined) {
      what_theKeywordThis_IsSupposedToBe = this
    }
    
    var localNames = []
    var localValues = []
    _.each(_.keys(dslLocals), function(key){
      localNames.push(key)
      localValues.push(dslLocals[key])
    })
    
    var userFunctionBody = "(_.bind(" + userFunction.toString().replace(/\s+$/, "") + ",this))()"
    var wrappingFunctionBody = "(function(" + localNames.join(",") + "){return " + userFunctionBody + "})"
    return eval(wrappingFunctionBody).apply(what_theKeywordThis_IsSupposedToBe, localValues)
  }
  
  outerFunction.dslLocals = dslLocals
  
  outerFunction.specialize = function(childDslLocals) {
    var allDslLocals = _.extend({}, outerFunction.dslLocals)
    var allDslLocals = _.extend(allDslLocals, childDslLocals)
    var childDslFunction = new DSLFunction()
    _.extend(childDslFunction.dslLocals, allDslLocals)
    return childDslFunction
  }
  
  return outerFunction
})





//knit/builder_function ======================================================

knit.createBuilderFunction = function(setup) {
  var bindings = typeof setup.bindings == "function" ? setup.bindings : function(){return setup.bindings}

  var referenceResolvingWrapper = function() {
    var dslFunction = new DSLFunction()
    _.extend(dslFunction.dslLocals, knit.createBuilderFunction.dslLocals)
    var environment = new knit.ReferenceEnvironment()
    environment.decorate(dslFunction.dslLocals, bindings)

    var result = dslFunction.apply(null, arguments)
    environment.resolve(bindings())
    return result
  }
  return referenceResolvingWrapper
}

knit.createBuilderFunction.dslLocals = {}




//knit/rows_and_objects ======================================================

knit.mixin.RowsAndObjects = function(proto) {
  proto.rows = function(){return this.perform().rows()}
  proto.objects = function(){return this.perform().objects()}
}



//knit/algebra/predicate/equality ======================================================

knit.algebra.predicate.Equality = function() {
  
  var F = function(leftAtom, rightAtom) {
    this.leftAtom = leftAtom
    this.rightAtom = rightAtom
  }; var p = F.prototype

  p._isAttribute = function(thing) {
    return thing.name && !thing.attributes
  }
  
  p._attributesReferredTo = function() {
    var attributes = []
    if (this._isAttribute(this.leftAtom)) { 
      attributes.push(this.leftAtom)
    } 
    if (this._isAttribute(this.rightAtom)) { 
      attributes.push(this.rightAtom)
    } 
    return attributes
  }
  
  p._attributesFromRelations = function(relations) {
    var attributesFromRelations = []
    _.each(relations, function(r){attributesFromRelations = attributesFromRelations.concat(r.attributes())})
    return attributesFromRelations
  }

  p.concernedWithNoOtherRelationsBesides = function() {
    var expectedExclusiveRelations = _.toArray(arguments)
    var expectedExclusiveRelationAttributes = _.flatten(_.map(expectedExclusiveRelations, function(r){return r.attributes()}))
    
    var foundAnAttributeNotContainedByExpectedExclusiveRelations = 
      _.detect(this._attributesReferredTo(), function(attributeReferredTo){
        return !(_.detect(expectedExclusiveRelationAttributes, function(expectedAttr){return attributeReferredTo.isSame(expectedAttr)}))
      })
    return !foundAnAttributeNotContainedByExpectedExclusiveRelations
  }
    
  p.concernedWithAllOf = function() {
    var expectedRelations = _.toArray(arguments)
    var myAttributes = this._attributesReferredTo()
    
    _.each(this._attributesReferredTo(), function(attr){
      var relationToCheckOff = _.detect(expectedRelations, function(r){return attr.sourceRelation().isSame(r)})
      if (relationToCheckOff) expectedRelations = _.without(expectedRelations, relationToCheckOff)
    })

    return _.isEmpty(expectedRelations)
  }
    

  p._areTheseTwoThingsTheSame = function(a, b) {
    return a.isSame && b.isSame && a.isSame(b) || a == b
  }
  
  p.isSame = function(other) {  
    return other.constructor == F && 
           this._areTheseTwoThingsTheSame(this.leftAtom, other.leftAtom) &&
           this._areTheseTwoThingsTheSame(this.rightAtom, other.rightAtom)
  }
  
  p.isEquivalent = function(other) {
    return this.isSame(other) ||
             other.constructor == F && 
             this._areTheseTwoThingsTheSame(this.leftAtom, other.rightAtom) &&
             this._areTheseTwoThingsTheSame(this.rightAtom, other.leftAtom)
  }

  p._inspectAtom = function(value) {
    if (this._isAttribute(value)) {
      return value.inspect()
    } else if (typeof value == "string") {
      return "'" + value + "'"
    } else {
      return "" + value
    }
  }
  
  p.inspect = function() { return "eq(" + this._inspectAtom(this.leftAtom) + "," + 
                                          this._inspectAtom(this.rightAtom) + ")" }

  return F
}()

knit.createBuilderFunction.dslLocals.equality = function(leftAtom, rightAtom) {
  return new knit.algebra.predicate.Equality(leftAtom, rightAtom)
}

knit.createBuilderFunction.dslLocals.eq = knit.createBuilderFunction.dslLocals.equality



//knit/algebra/predicate/true_false ======================================================

knit.algebra.predicate.True = function() {
  return new knit.algebra.predicate.Equality(1,1)
}
knit.createBuilderFunction.dslLocals.TRUE = new knit.algebra.predicate.True()

knit.algebra.predicate.False = function() {
  return new knit.algebra.predicate.Equality(1,2)
}
knit.createBuilderFunction.dslLocals.FALSE = new knit.algebra.predicate.False()



//knit/algebra/predicate/conjunction ======================================================

knit.algebra.predicate.Conjunction = function(){

  var F = function(leftPredicate, rightPredicate) { //har
    this.leftPredicate = leftPredicate
    this.rightPredicate = rightPredicate
  }; var p = F.prototype

  p.concernedWithNoOtherRelationsBesides = function() {
    var expectedExclusiveRelations = _.toArray(arguments)
    return this.leftPredicate.concernedWithNoOtherRelationsBesides.apply(this.leftPredicate, expectedExclusiveRelations) &&
           this.rightPredicate.concernedWithNoOtherRelationsBesides.apply(this.rightPredicate, expectedExclusiveRelations)
  }
  
  p.concernedWithAllOf = function() {
    var expectedRelations = _.toArray(arguments)
  
    var self = this
    var remainingRelations = _.reject(expectedRelations, function(relation){
      return self.leftPredicate.concernedWithAllOf(relation) || self.rightPredicate.concernedWithAllOf(relation)
    })

    return _.isEmpty(remainingRelations)
  }
      
  p.isSame = function(other) {
    return other.constructor == F && 
           this.leftPredicate.isSame(other.leftPredicate) &&
           this.rightPredicate.isSame(other.rightPredicate)
  }
  
  p.isEquivalent = function(other) {
    return this.isSame(other) ||
             other.constructor == F && 
             this.leftPredicate.isEquivalent(other.rightPredicate) &&
             this.rightPredicate.isEquivalent(other.leftPredicate)
  }
  
  p.inspect = function() { return "and(" + this.leftPredicate.inspect() + "," + 
                                           this.rightPredicate.inspect() + ")" }
  
  return F
}()

knit.createBuilderFunction.dslLocals.conjunction = function(leftPredicate, rightPredicate) {
  return new knit.algebra.predicate.Conjunction(leftPredicate, rightPredicate)
}

knit.createBuilderFunction.dslLocals.and = knit.createBuilderFunction.dslLocals.conjunction



//knit/algebra/predicate ======================================================



//knit/algebra/join ======================================================

knit.algebra.Join = function(){

  var F = function(relationOne, relationTwo, predicate) {
    this.relationOne = relationOne
    this.relationTwo = relationTwo
    this.predicate = predicate || new knit.algebra.predicate.True()
  }; var p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.newNestedAttribute = function() {    
    return this.relationOne.newNestedAttribute.apply(this.relationOne, arguments)
  }
  
  p.perform = function() {
    return this.relationOne.perform().performJoin(this.relationTwo.perform(), this.predicate)
  }

  p.attributes = function(){ return this.relationOne.attributes().concat(this.relationTwo.attributes()) }
  
  p._predicateIsDefault = function() {
    return this.predicate.isSame(new knit.algebra.predicate.True())
  }
  
  p.appendToPredicate = function(additionalPredicate) {
    if (this._predicateIsDefault()) {
      this.predicate = additionalPredicate
    } else {
      this.predicate = new knit.algebra.predicate.Conjunction(this.predicate, additionalPredicate)
    }
    return this
  }

  p.isSame = function(other) {
    return other.constructor == F && 
           this.relationOne.isSame(other.relationOne) &&
           this.relationTwo.isSame(other.relationTwo) &&
           this.predicate.isSame(other.predicate)
  }
 
  p.isEquivalent = function(other) {
    return this.isSame(other) ||
             other.constructor == F && 

             ((this.relationOne.isSame(other.relationOne) &&
              this.relationTwo.isSame(other.relationTwo)) ||

             (this.relationOne.isSame(other.relationTwo) &&
              this.relationTwo.isSame(other.relationOne))) &&

             this.predicate.isEquivalent(other.predicate)
  }
  
  p.split = p.merge = function(){return this}
  
  p.inspect = function(){
    var inspectStr = "join(" + this.relationOne.inspect() + "," + this.relationTwo.inspect()
  
    if (!this._predicateIsDefault()) {
      inspectStr += "," + this.predicate.inspect()
    }
  
    inspectStr += ")"
    return inspectStr
  }

  return F
}()

knit.createBuilderFunction.dslLocals.join = function(relationOne, relationTwo, predicate) { 
  return new knit.algebra.Join(relationOne, relationTwo, predicate) 
}


knit.algebra.LeftOuterJoin = function(relationOne, relationTwo, predicate) {
  var join = new knit.algebra.Join(relationOne, relationTwo, predicate)
  join.perform = function() {
    return this.relationOne.perform().performLeftOuterJoin(this.relationTwo.perform(), this.predicate)
  }
  return join
}

knit.createBuilderFunction.dslLocals.leftOuterJoin = function(relationOne, relationTwo, predicate) { 
  return new knit.algebra.LeftOuterJoin(relationOne, relationTwo, predicate) 
}



knit.algebra.RightOuterJoin = function(relationOne, relationTwo, predicate) {
  var join = new knit.algebra.Join(relationOne, relationTwo, predicate)
  join.perform = function() {
    return this.relationOne.perform().performRightOuterJoin(this.relationTwo.perform(), this.predicate)
  }
  return join
}

knit.createBuilderFunction.dslLocals.rightOuterJoin = function(relationOne, relationTwo, predicate) { 
  return new knit.algebra.RightOuterJoin(relationOne, relationTwo, predicate) 
}



knit.algebra.NaturalJoin = function(relationOne, relationTwo) {
  var join = new knit.algebra.Join(relationOne, relationTwo, new knit.algebra.predicate.True())

  join.perform = function() {
    var relationOneAttributeNames = _.map(this.relationOne.attributes(), function(attr){return attr.name()})
    var relationTwoAttributeNames = _.map(this.relationTwo.attributes(), function(attr){return attr.name()})
    var commonAttributeNames = _.intersect(relationOneAttributeNames, relationTwoAttributeNames)
    var commonIdAttributeNames = _.select(commonAttributeNames, function(attributeName){return attributeName.match(/Id$/)})

    function attributeNamesToPredicate(attributeNames, relationOne, relationTwo) {
      if (attributeNames.length == 1) {
        var attributeName = attributeNames.shift()
        return new knit.algebra.predicate.Equality(relationOne.attr(attributeName), relationTwo.attr(attributeName))
      } else if (attributeNames.length > 1) {
        var attributeOne = attributeNames.shift()
        return new knit.algebra.predicate.Conjunction(attributeNamesToPredicate([attributeOne], relationOne, relationTwo), 
                                                      attributeNamesToPredicate(attributeNames, relationOne, relationTwo))
      } else {
        return new knit.algebra.predicate.True()
      }
    }

    var predicate = attributeNamesToPredicate(commonIdAttributeNames, this.relationOne, this.relationTwo)
    
    return this.relationOne.perform().performRightOuterJoin(this.relationTwo.perform(), predicate)
  }

  return join
}

knit.createBuilderFunction.dslLocals.naturalJoin = function(relationOne, relationTwo) { 
  return new knit.algebra.NaturalJoin(relationOne, relationTwo) 
}



//knit/algebra/select ======================================================

knit.algebra.Select = function() {
  
  var F = function(relation, criteria) {
    this.relation = relation
    this.criteria = criteria
  }; var p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.perform = function() { return this.relation.perform().performSelect(this.criteria) }

  p.attributes = function(){ return this.relation.attributes() }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }
  
  p.merge = function() {
    if (this.relation.criteria) {
      return new F(this.relation.relation.merge(), new knit.algebra.predicate.Conjunction(this.relation.criteria, this.criteria))
    } else {
      return this
    }
  }
  
  p.split = function() {
    if (this.criteria.constructor == knit.algebra.predicate.Conjunction) {
        return new F(
          new F(this.relation.split(), this.criteria.leftPredicate),
          this.criteria.rightPredicate
        )
    } else {
      return this
    }
  }
  
  p._doPush = function(relation) { return new F(relation, this.criteria).push() }
  
  p.push = function() {
    if (knit.quacksLike(this.relation, knit.signature.join)) {
      var join = this.relation
      if (this.criteria.concernedWithNoOtherRelationsBesides(join.relationOne)) {
        join.relationOne = this._doPush(join.relationOne)
        return join
      } else if (this.criteria.concernedWithNoOtherRelationsBesides(join.relationTwo)) {
        join.relationTwo = this._doPush(join.relationTwo)
        return join
      } else if (this.criteria.concernedWithNoOtherRelationsBesides(join.relationOne, join.relationTwo) &&
                 this.criteria.concernedWithAllOf(join.relationOne, join.relationTwo)) {
        join.appendToPredicate(this.criteria)
        return join
      } else {
        return this
      }
    } else if (this.relation.push) {
  
      var innerPushResult = this.relation.push()
      if (innerPushResult===this.relation) { //bounce
        // me(
        //   you(
        //     yourRelation,
        //    [yourStuff]
        //   ),
        //  [myStuff]
        // )
        
        //becomes
        
        // you(
        //   me(
        //     yourRelation,
        //    [yourStuff]
        //   ),
        //  [myStuff]
        // )
        
        var me = this
        
        var you = this.relation
        var yourRelation = this.relation.relation
        
        me.relation = yourRelation
        you.relation = me.push()
        
        return you
      } else {
        this.relation = innerPushResult
        return this.push()
      }
    } else {
      return this
    }
  }
  
  p.isSame = function(other) {
    return other.constructor == F && 
           this.relation.isSame(other.relation) &&
           this.criteria.isSame(other.criteria)
  }
  
  p.isEquivalent = function(other) {
    if (other.constructor == F) {
      var thisMerged = this.merge()
      var otherMerged = other.merge()
    
      return thisMerged.isSame(otherMerged) ||
               thisMerged.relation.isEquivalent(otherMerged.relation) &&
               thisMerged.criteria.isEquivalent(otherMerged.criteria)
    } else {
      return false
    }
  }
  
  p.inspect = function(){return "select(" + this.relation.inspect() + "," + 
                                            this.criteria.inspect() + ")"}
  
  return F
}()

knit.createBuilderFunction.dslLocals.select = function(relation, criteria) {
  return new knit.algebra.Select(relation, criteria)
}



//knit/algebra/project ======================================================

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


knit.createBuilderFunction.dslLocals.project = function(relation, attributes) {
  return new knit.algebra.Project(relation, attributes)
}


//knit/algebra/order ======================================================

knit.algebra.Order = function(){
  
  var F = function(relation, orderAttribute, direction) {
    this.relation = relation
    this.orderAttribute = orderAttribute
    this.direction = direction
  }; var p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.perform = function() {
    return this.relation.perform().performOrder(this.orderAttribute, this.direction)
  }

  p.attributes = function(){ return this.relation.attributes() }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }
  
  p.isSame = p.isEquivalent = function(other) {
    return other.constructor == F && 
           this.relation.isSame(other.relation) &&
           this.orderAttribute.isSame(other.orderAttribute) &&
           this.direction == other.direction
  }
  
  p.inspect = function(){return "order." + this.direction + 
                                  "(" + this.relation.inspect() + "," + 
                                        this.orderAttribute.inspect() + ")"}
  
  F.ASC = "asc"
  F.DESC = "desc"
  
  return F
}()

knit.createBuilderFunction.dslLocals.order = {
  asc: function(relation, orderAttribute) { return new knit.algebra.Order(relation, orderAttribute, knit.algebra.Order.ASC) },
  desc: function(relation, orderAttribute) { return new knit.algebra.Order(relation, orderAttribute, knit.algebra.Order.DESC) }
}





//knit/algebra/nest_unnest ======================================================

knit.algebra.Unnest = function(){

  var F = function(relation, nestedAttribute) {
    this.relation = relation
    this.nestedAttribute = nestedAttribute
  }; var p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.perform = function() {
    return this.relation.perform().performUnnest(this.nestedAttribute)
  }  

  p.attributes = function(){ return this.relation.attributes() }
  
  p.isSame = p.isEquivalent = function(other) {
    return other.constructor == F && 
           this.relation.isSame(other.relation) &&
           this.nestedAttribute.isSame(other.nestedAttribute)
  }
  
  p.inspect = function(){return "unnest(" + this.relation.inspect() + "," + 
                                            this.nestedAttribute.inspect() + ")"}
  
  return F
}()

knit.createBuilderFunction.dslLocals.unnest = function(relation, nestedAttribute) { 
  return new knit.algebra.Unnest(relation, nestedAttribute) 
}

knit.algebra.Nest = function(){

  var F = function(relation, nestedAttribute) {
    this.relation = relation
    this.nestedAttribute = nestedAttribute
    this.nestedAttribute.setSourceRelation(relation)
  }; var p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.perform = function() {
    //impose order for now
    var relation = this.relation
    
    var forceOrderOnTheseAttributes = _.without(this.attributes(), this.nestedAttribute)
    while(forceOrderOnTheseAttributes.length > 0) {
      var orderByAttr = forceOrderOnTheseAttributes.shift()
      relation = new knit.algebra.Order(relation, orderByAttr, knit.algebra.Order.ASC)
    }
    
    return relation.perform().performNest(this.nestedAttribute, this.attributes())
  }
  
  p.attributes = function(){ 
    var result = [].concat(this.relation.attributes())
    var self = this
    var attributePositions = _.map(this.nestedAttribute.nestedRelation().attributes(), function(attribute){return knit.indexOfSame(result, attribute)})
    attributePositions.sort()
    var firstAttributePosition = attributePositions.shift()
    result.splice(firstAttributePosition,1,this.nestedAttribute)
  
    attributePositions.reverse()
    _.each(attributePositions, function(pos){result.splice(pos,1)})
    return result
  }
  
  p.newNestedAttribute = function() {
    return this.relation.newNestedAttribute.apply(this.relation, arguments)
  }
  
  p.isSame = p.isEquivalent = function(other) {
    return other.constructor == F && 
           this.relation.isSame(other.relation) &&
           this.nestedAttribute.isSame(other.nestedAttribute)
  }
  
  p.inspect = function(){return "nest(" + this.relation.inspect() + "," + this.nestedAttribute.inspect() + ")"}

  return F
}()

knit.createBuilderFunction.dslLocals.nest = function(relation, nestedAttribute) {
  return new knit.algebra.Nest(relation, nestedAttribute)
}







//knit/engine/memory ======================================================

knit.engine.Memory = function() {
}

knit.engine.Memory.prototype.createRelation = function(name, attributeNames, primaryKey) {
  return new knit.engine.Memory.MutableRelation(name, attributeNames, primaryKey)
}




//knit/engine/memory/attribute ======================================================
knit.engine.Memory.Attribute = function(){

  var F = function(name, sourceRelation) {
    this._name = name
    this._sourceRelation = sourceRelation
  }; var p = F.prototype

  p.name = function() { return this._name }
  p.sourceRelation = function() { return this._sourceRelation }
  p.isSame = function(other) {
    return knit.quacksLike(other, knit.signature.attribute) &&
           this.name() == other.name() &&
           this.sourceRelation().id() == other.sourceRelation().id()
  }
  p.isEquivalent = p.isSame
  
  p.inspect = function() {
    return this.name()
  }
  
  return F
}()

knit.engine.Memory.NestedAttribute = function(){

  var F = function(name, nestedRelation, sourceRelation) {
    this._name = name
    this._nestedRelation = nestedRelation
    this._sourceRelation = sourceRelation
  }; var p = F.prototype
  
  p.name = function() { return this._name }
  p.sourceRelation = function() { return this._sourceRelation }
  p.nestedRelation = function() { return this._nestedRelation }
  p.isSame = function(other) {
    return knit.quacksLike(other, knit.signature.nestedAttribute) &&
           this.name() == other.name() &&
           this.nestedRelation().id() == other.nestedRelation().id()
  }
  p.isEquivalent = p.isSame
  
  p.inspect = function() {
    return this.name() + ":" + this.nestedRelation().inspect()
  }
  
  return F
}()



//knit/engine/memory/relation ======================================================
knit.engine.Memory.Relation = function() {
  
  var _id = 0
  
  var F = function(name, attributeNames, primaryKey, rows, costSoFar) {
    _id += 1
    this._id = "memory_" + _id + "_" + name
    this._name = name
    var self = this
    this.nameToAttribute = {}
    this._attributes = []
  
    var self = this
    _.each(attributeNames, function(attr){
      var attrToAdd = null
      if (attr.name) {
        attrToAdd = attr
      } else if (typeof attr == "string") {
        var attributeName = attr
        attrToAdd = new knit.engine.Memory.Attribute(attributeName, self)
      } else {
        var attributeName = _.keys(attr)[0]
        var nestedRelation = _.values(attr)[0]
        attrToAdd = new knit.engine.Memory.NestedAttribute(attributeName, nestedRelation, self)
      }
    
      self._attributes.push(attrToAdd)
      self.nameToAttribute[attrToAdd.name()] = attrToAdd
    })
  
  
    this._pkAttributeNames = primaryKey || []
    var pkPositions = 
      _.map(this._pkAttributeNames, function(pkAttributeName){
        var position = -1
        _.each(attributeNames, function(attributeName, i){
          if (pkAttributeName == attributeName) {
            position = i
          }
        })
        return position
      })
  
    this._rowStore = new knit.engine.Memory.StandardRowStore(pkPositions, rows || [])
    this.cost = costSoFar || 0
  }; var p = F.prototype

  p.id = function(){ return this._id }
  p.name = function(){ return this._name }
  p.attributes = function(){ return this._attributes }
  
  p.attr = function() {
    var args = _.toArray(arguments)
    if (args.length == 0) {
      return null
    } else if (args.length == 1) {
      return this.nameToAttribute[args[0]]
    } else {
      var self = this
      return _.map(args, function(attributeName){return self.nameToAttribute[attributeName]})
    }
  }
  p.split = function(){return this}
  p.merge = function(){return this}
  
  p.isSame = function(other) {
    return other.id && this.id() == other.id()
  }
  
  p.isEquivalent = function(other) {
    return knit.quacksLike(other, knit.signature.relation) &&
           this.attributes().length == other.attributes().length &&
           _.detect(this.attributes(), function(attr, i){return !attr.isSame(other.attributes()[i])}) == null
  }
  
  
  p.inspect = function() {
    return this.name() + "[" + 
           _.map(this.attributes(), function(attr){return attr.inspect()}).join(",") + 
           "]" 
  }

  p.rows = function() {
    return this._rowStore.rows()
  }
  
  p.objects = function(rows) {
    rows = rows || this.rows()
    var self = this
    return _.map(rows, function(row){
      var object = {}
      _.each(row, function(value, columnPosition){
        var attr = self._attributes[columnPosition]
        var propertyName = attr.name()
        if (attr.nestedRelation) {
          object[propertyName] = attr.nestedRelation().objects(value)
        } else {
          object[propertyName] = value
        }
      })
      return object
    })
  }
  
  p.perform = function() {
    return this
  }
  
  function rowWithAttributes(row, attributes) {
    var rowWithAttributes = []
    for (var i=0; i<attributes.length; i++) {
      rowWithAttributes.push([attributes[i], row[i]])
    }
    return rowWithAttributes
  }
  
  p._rowsWithAttributes = function() {
    var self = this
    return _.map(this._rowStore.rows(), function(row){
      return rowWithAttributes(row, self.attributes())
    })
  }
  
  p.performSelect = function(criteria) {
    
    var matchingAttributesToRows = 
      _.select(this._rowsWithAttributes(), function(rowWithAttributes){return criteria.match(rowWithAttributes)})
    
    var matchingRows = 
      _.map(matchingAttributesToRows, 
            function(attributeToValueRow){
              return _.map(attributeToValueRow, function(attributeToValue){return attributeToValue[1]})
            })

    return this._newRelation(matchingRows) 
  }
  
  p.performProject = function(attributes) {
    var self = this
    var positionsToKeep = _.map(attributes, function(attr){return knit.indexOfSame(self.attributes(), attr)})
    var projectedRows = _.map(this.rows(), function(row) {
      return _.map(positionsToKeep, function(position) {
        return row[position]
      })
    })
    return this._newRelation(projectedRows, this.name(), attributes) 
  }

  function joinRows(combinedAttributes, outerRows, innerRows, predicate, candidateJoinRowFunction, 
                    innerAttributes, noInnerMatchFoundFunction) {
    var resultRows = []
    
    _.each(outerRows, function(outerRow){
      var innerRowMatchFound = false
      _.each(innerRows, function(innerRow){
        var candidateJoinRow = candidateJoinRowFunction(outerRow, innerRow) 
        if (predicate.match(rowWithAttributes(candidateJoinRow, combinedAttributes))) {
          resultRows.push(candidateJoinRow)
          innerRowMatchFound = true
        }
      })
      
      if ( noInnerMatchFoundFunction && ! innerRowMatchFound) {
        noInnerMatchFoundFunction(innerAttributes, outerRow, resultRows)
      }
    })

    return resultRows
  }


  p.performJoin = function(relationTwo, predicate) {
    var combinedAttributes = [].concat(this.attributes()).concat(relationTwo.attributes())           
    return this._newRelation(
      joinRows(
        combinedAttributes,
        this.rows(),
        relationTwo.rows(),
        predicate,
        function(leftRow, rightRow){return [].concat(leftRow).concat(rightRow)}
      ), 
      this.name() + "__" + relationTwo.name(), 
      combinedAttributes)
  }

  p.performLeftOuterJoin = function(relationTwo, predicate) {
    var combinedAttributes = [].concat(this.attributes()).concat(relationTwo.attributes())           
    return this._newRelation(
      joinRows(
        combinedAttributes,
        this.rows(),
        relationTwo.rows(),
        predicate,
        function(leftRow, rightRow){return [].concat(leftRow).concat(rightRow)},
        relationTwo.attributes(),
        function(rightAttributes, leftRow, joinRows){
          var rightAsNulls = []
          _.times(rightAttributes.length, function(){rightAsNulls.push(null)})
          var leftRowWithNullRightValues = [].concat(leftRow).concat(rightAsNulls)
          joinRows.push(leftRowWithNullRightValues)
        }
      ), 
      this.name() + "__" + relationTwo.name(), 
      combinedAttributes)
  }

  p.performRightOuterJoin = function(relationTwo, predicate) {
    var combinedAttributes = [].concat(this.attributes()).concat(relationTwo.attributes())           
    return this._newRelation(
      joinRows(
        combinedAttributes,
        relationTwo.rows(),
        this.rows(),
        predicate,
        function(rightRow, leftRow){return [].concat(leftRow).concat(rightRow)},
        this.attributes(),
        function(leftAttributes, rightRow, joinRows){
          var leftAsNulls = []
          _.times(leftAttributes.length, function(){leftAsNulls.push(null)})
          var rightRowWithNullLeftValues = [].concat(leftAsNulls).concat(rightRow)
          joinRows.push(rightRowWithNullLeftValues)
        }
      ), 
      this.name() + "__" + relationTwo.name(), 
      combinedAttributes)
  }

  p.performOrder = function(orderAttribute, direction) {
    var columnNumber = knit.indexOfSame(this.attributes(), orderAttribute)
    var sortedRows = _.sortBy(this.rows(), function(row){ return row[columnNumber] });
    if (direction == knit.algebra.Order.DESC) sortedRows.reverse()
    return this._newRelation(sortedRows) 
  }

  p.performUnnest = function(nestedAttribute) {
    var newAttributes = [].concat(this.attributes())
    var nestedAttributeIndex = knit.indexOfSame(newAttributes, nestedAttribute)
    newAttributes.splice.apply(newAttributes, [nestedAttributeIndex,1].concat(nestedAttribute.nestedRelation().attributes()))
    
    var unnestedRows = []

    _.each(this.rows(), function(row) {
      var nestedRows = row[nestedAttributeIndex]
      _.each(nestedRows, function(nestedRow){
        var newRow = [].concat(row)
        newRow.splice.apply(newRow, [nestedAttributeIndex,1].concat(nestedRow))
        unnestedRows.push(newRow)
      })
    })
    return this._newRelation(unnestedRows, this.name(), newAttributes) 
  }
  
  p.performNest = function(nestedAttribute, newAttributeArrangement) {
    //assumption: this relation is ordered by all non-nested attributes.  
    //note that for now this is guaranteed by nest.perform.
    var self = this

    var oldNestedPositions = []
    _.each(nestedAttribute.nestedRelation().attributes(), function(nestedAttr) {
      var oldNestedPosition = knit.indexOfSame(self.attributes(), nestedAttr)
      oldNestedPositions.push(oldNestedPosition)
    })

    var newFlatAttrPositionToOldFlatAttrPosition = {}
    var oldFlatPositions = []
    _.each(newAttributeArrangement, function(newAttr, newPosition){
      if (!newAttr.isSame(nestedAttribute)) {
        var oldFlatPosition = knit.indexOfSame(self.attributes(), newAttr)
        oldFlatPositions.push(oldFlatPosition)
        newFlatAttrPositionToOldFlatAttrPosition[newPosition] = oldFlatPosition
      }
    })
    
    var nestedAttributePosition = knit.indexOfSame(newAttributeArrangement, nestedAttribute)
    
    var newRows = []
    
    var currentNewRow = null
    var currentFlatValues = null
    _.each(this.rows(), function(row) {
      var flatValuesForThisRow = _.map(oldFlatPositions, function(flatPosition){return row[flatPosition]})
      var nestedValuesForThisRow = _.map(oldNestedPositions, function(nestedPosition){return row[nestedPosition]})
      var allValuesAreNull = _.without(nestedValuesForThisRow, null).length==0
      
      if (_.isEqual(flatValuesForThisRow, currentFlatValues)) {
        if ( ! allValuesAreNull) currentNewRow[nestedAttributePosition].push(nestedValuesForThisRow)
      } else {
        if (currentNewRow) {
          newRows.push(currentNewRow)
        }
        
        currentNewRow = _.map(newAttributeArrangement, function(attr, newPos){
          if (attr.isSame(nestedAttribute)) {
            return allValuesAreNull ? [] : [nestedValuesForThisRow]
          } else {
            var oldPos = newFlatAttrPositionToOldFlatAttrPosition[newPos]
            return row[oldPos]
          }
        })
        
        currentFlatValues = flatValuesForThisRow
      }
    })
    
    if (currentNewRow) {
      newRows.push(currentNewRow)
    }
    
    return this._newRelation(newRows, this.name(), newAttributeArrangement) 
  }

  p.newNestedAttribute = function(attributeName, attributesToNest) {
    var nestedRelation = new knit.engine.Memory.Relation("(nested)", attributesToNest, [], [], 0) 
    return new knit.engine.Memory.NestedAttribute(attributeName, nestedRelation, this)
  }

  p._newRelation = function(rows, name, attributes) {
    var newName = name || this.name()
    var newAttributes = attributes || this.attributes()
    
    //curry?
    return new knit.engine.Memory.Relation(newName, newAttributes, this._pkAttributeNames, rows, this.cost + rows.length) 
  }
  
  return F
}()

knit.engine.Memory.MutableRelation = function(name, attributeNames, primaryKey) {
  var result = new knit.engine.Memory.Relation(name, attributeNames, primaryKey)
  _.extend(result, {
    merge: function(rowsToAdd) {
      this._rowStore.merge(rowsToAdd)
      return this
    }
  })
  return result
}



//knit/engine/memory/predicate ======================================================
knit.algebra.predicate.True.prototype.match = function(attributeToValue) {
  return true
}

knit.algebra.predicate.False.prototype.match = function(attributeToValue) {
  return false
}

;(function(F){
  F.prototype._getValueForAttribute = function(attribute, attributeToValue) {
    var pair = _.detect(attributeToValue, function(pair){
      var attr = pair[0]
      var value = pair[1]
      return attr.isSame(attribute)
    })
    
    return pair ? pair[1] : null
  }

  F.prototype._getValue = function(atom, attributeToValue) {
    return this._isAttribute(atom) ? this._getValueForAttribute(atom, attributeToValue) : atom
  }

  F.prototype.match = function(attributeToValue) {
    var left = this._getValue(this.leftAtom, attributeToValue)
    var right = this._getValue(this.rightAtom, attributeToValue)
    return left == right
  }
  
})(knit.algebra.predicate.Equality)

knit.algebra.predicate.Conjunction.prototype.match = function(attributeToValue) {
  return this.leftPredicate.match(attributeToValue) && this.rightPredicate.match(attributeToValue)
}  



//knit/engine/memory/standard_row_store ======================================================
knit.engine.Memory.StandardRowStore = function(){

  var F = function(keyColumns, initialRows) {
    this._keyColumns = keyColumns
    this._rows = initialRows || []
  }; var p = F.prototype

  p.merge = function(moreRows) {
    
    var self = this
    
    function hasKey() {
      return self._keyColumns.length >= 1
    }
    
    function treatAsSet(moreRows) {
      //pretty bad perf...
        //future...cost-aware array?
        //test-drive to lower cost...
        //this._rows.with(function(arr){
        //   ...tracks cost of all iterating you do in here  
        //})
        //
        //Also, cost-aware map
          //check out js map
      var keyToRow = {}
      var keyToArrayIndex = {}
      
      _.each(self._rows, function(row, i){
        var key = _.map(self._keyColumns, function(arrayIndex){return "" + row[arrayIndex]}).join("_")
        keyToRow[key] = row
        keyToArrayIndex[key] = i
      })
    
      _.each(moreRows, function(newRow){
        var newKey = _.map(self._keyColumns, function(arrayIndex){return "" + newRow[arrayIndex]}).join("_")
        if (keyToRow[newKey]) {
          var i = keyToArrayIndex[newKey]
          self._rows[i] = newRow
        } else {
          self._rows.push(newRow)
        }
      })
    }
    
    if (hasKey()) {
      treatAsSet(moreRows)
    } else {
      self._rows = self._rows.concat(moreRows)
    }
  },
  
  p.rows = function(){ return this._rows }
  
  return F
}()









