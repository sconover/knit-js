
(function() {// modulr (c) 2010 codespeaks sàrl
// Freely distributable under the terms of the MIT license.
// For details, see:
//   http://github.com/codespeaks/modulr/blob/master/LICENSE

var modulr = (function(global) {
  var _dependencyGraph = {},
      _loadingFactories = {},
      _incompleteFactories = {},
      _factories = {},
      _modules = {},
      _exports = {},
      _handlers = [],
      _dirStack = [''],
      PREFIX = '__module__', // Prefix identifiers to avoid issues in IE.
      RELATIVE_IDENTIFIER_PATTERN = /^\.\.?\//,
      _forEach,
      _indexOf;
      
  _forEach = (function() {
    var hasOwnProp = Object.prototype.hasOwnProperty,
        DONT_ENUM_PROPERTIES = [
          'constructor', 'toString', 'toLocaleString', 'valueOf',
          'hasOwnProperty','isPrototypeOf', 'propertyIsEnumerable'
        ],
        LENGTH = DONT_ENUM_PROPERTIES.length,
        DONT_ENUM_BUG = true;
    
    function _forEach(obj, callback) {
      for(var prop in obj) {
        if (hasOwnProp.call(obj, prop)) {
          callback(prop, obj[prop]);
        }
      }
    }
    
    for(var prop in { toString: true }) {
      DONT_ENUM_BUG = false
    }
    
    if (DONT_ENUM_BUG) {
      return function(obj, callback) {
         _forEach(obj, callback);
         for (var i = 0; i < LENGTH; i++) {
           var prop = DONT_ENUM_PROPERTIES[i];
           if (hasOwnProp.call(obj, prop)) {
             callback(prop, obj[prop]);
           }
         }
       }
    }
    
    return _forEach;
  })();
  
  _indexOf = (function() {
    var nativeIndexOf = Array.prototype.indexOf;
    if (typeof nativeIndexOf === 'function') {
      return function(array, item) {
        return nativeIndexOf.call(array, item);
      }
    }
    
    return function(array, item) {
      for (var i = 0, length = array.length; i < length; i++) {
        if (item === array[i]) { return i; }
      }
      return -1;
    }
  })();
  
  function require(identifier) {
    var fn, mod,
        id = resolveIdentifier(identifier),
        key = PREFIX + id,
        expts = _exports[key];
    
    if (!expts) {
      _exports[key] = expts = {};
      _modules[key] = mod = { id: id };
      
      fn = _factories[key];
      _dirStack.push(id.substring(0, id.lastIndexOf('/') + 1))
      try {
        if (!fn) { throw 'Can\'t find module "' + identifier + '".'; }
        if (typeof fn === 'string') {
          fn = new Function('require', 'exports', 'module', fn);
        }
        fn(require, expts, mod);
        _dirStack.pop();
      } catch(e) {
        _dirStack.pop();
        // We'd use a finally statement here if it wasn't for IE.
        throw e;
      }
    }
    return expts;
  }
  
  function resolveIdentifier(identifier) {
    var dir, parts, part, path;
    
    if (!RELATIVE_IDENTIFIER_PATTERN.test(identifier)) {
      return identifier;
    }
    dir = _dirStack[_dirStack.length - 1];
    parts = (dir + identifier).split('/');
    path = [];
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      switch (part) {
        case '':
        case '.':
          continue;
        case '..':
          path.pop();
          break;
        default:
          path.push(part);
      }
    }
    return path.join('/');
  }
  
  function define(descriptors, dependencies) {
    var missingDependencies;
    if (dependencies) {
      // Check to see if any of the required dependencies 
      // weren't previously loaded.
      // Build an array of missing dependencies with those which weren't.
      for (var i = 0, length = dependencies.length; i < length; i++) {
        var key = PREFIX + dependencies[i];
        if (!(key in _factories) && !(key in _incompleteFactories)) {
          missingDependencies = missingDependencies || [];
          missingDependencies.push(key);
        }
      }
    }
    
    if (missingDependencies) {
      // Add each newly defined descriptor to our list of
      // factories missing dependencies.
      // Build a dependency graph so we can handle subsequent 
      // require.define calls easily.
      _forEach(descriptors, function(id, factory) {
        var key = PREFIX + id;
        _dependencyGraph[key] = missingDependencies; // TODO clone?
        _incompleteFactories[key] = factory;
      });
      // load the missing modules.
      loadModules(missingDependencies);
    } else {
      // There aren't any missing dependencies in the factories
      // which were just defined. Lets move them to a list of
      // synchronously requirable factories.
      prepare(descriptors);
      // While we're at it, let's call all async handlers whose
      // dependencies are now available.
      callRipeHandlers();
    }
  }
  
  function prepare(descriptors) {
    // Handles factories for which all dependencies are
    // available.
    _forEach(descriptors, function(id, factory) {
      var key = PREFIX + id;
      // Move the factory from the list of factories missing
      // dependencies to the list of synchronously requirable
      // factories.
      _factories[key] = factory;
      delete _incompleteFactories[key];
      // Go through the dependency graph and remove the factory
      // from all of the missing dependencies lists.
      _forEach(_dependencyGraph, function(unused, dependencies) {
        var i = _indexOf(i, key);
        if (i > -1) { dependencies.splice(i, 1); }
      });
    });
    
    // Find all the factories which no longer have missing dependencies.
    var newFactories;
    _forEach(_dependencyGraph, function(key, dependencies) {
      if (dependencies.length === 0) {
        newFactories = newFactories || {};
        newFactories[key] = _incompleteFactories[key];
        delete _dependencyGraph[key];
      }
    });
    // recurse!
    if (newFactories) { prepare(newFactories); }
  }
  
  function ensure(dependencies, callback, errorCallback) {
    // Cache this new handler.
    _handlers.push({
      dependencies: dependencies,
      callback: callback,
      errorCallback: errorCallback
    });
    
    // Immediately callRipeHandlers(): you never know,
    // all of the required dependencies might be already
    // available.
    callRipeHandlers();
  }
  
  function callRipeHandlers() {
    var missingFactories;
    
    for (var i = 0, length = _handlers.length; i < length; i++) {
      // Go through all of the stored handlers.
      var handler = _handlers[i],
          dependencies = handler.dependencies,
          isRipe = true;
      for (var j = 0, reqLength = dependencies.length; j < reqLength; j++) {
        var id = dependencies[j];
        // If any dependency is missing, the handler isn't ready to be called.
        // Store those missing so we can later inform the loader.
        if (!_factories[PREFIX + id]) {
          missingFactories = missingFactories || [];
          if (_indexOf(missingFactories, id) < 0) {
            missingFactories.push(id);
          }
          isRipe = false;
        }
      }
      
      if (isRipe) {
        handler.callback(); // TODO error handling
      }
    }
    
    if (missingFactories) {
      loadModules(missingFactories);
    }
  }
  
  function loadModules(factories) {
    var missingFactories;
    for (var i = 0, length = factories.length; i < length; i++) {
      var factory = factories[i];
      if (!(factory in _loadingFactories)) {
        missingFactories = missingFactories || [];
        missingFactories.push(factory);
      }
    }
    if (missingFactories) {
      console.log(missingFactories);
    }
  }
  
  require.define = define;
  require.ensure = ensure;
  require.main = {};
  
  return {
    require: require
  };
})(this);

var require = modulr.require, module = require.main;
require.define({
'knit/algebra': function(require, exports, module) {
require("knit/algebra/join")
require("knit/algebra/predicate")
require("knit/algebra/select")

}, 
'knit/algebra/join': function(require, exports, module) {
require("knit/core")
require("knit/algebra/predicate")

knit.algebra.Join = function(relationOne, relationTwo, predicate) {
  this._attributes = relationOne.attributes().concat(relationTwo.attributes())
  this.relationOne = relationOne
  this.relationTwo = relationTwo
  this.predicate = predicate || new knit.algebra.predicate.True()
}

_.extend(knit.algebra.Join.prototype, {
  attributes: function(){ return this._attributes },
  
  _predicateIsDefault: function() {
    return this.predicate.isSame(new knit.algebra.predicate.True())
  },
  
  appendToPredicate: function(additionalPredicate) {
    if (this._predicateIsDefault()) {
      this.predicate = additionalPredicate
    } else {
      this.predicate = new knit.algebra.predicate.Conjunction(this.predicate, additionalPredicate)
    }
    return this
  },

  isSame: function(other) {
    return other.constructor == knit.algebra.Join && 
           this.relationOne.isSame(other.relationOne) &&
           this.relationTwo.isSame(other.relationTwo) &&
           this.predicate.isSame(other.predicate)
  },
 
  isEquivalent: function(other) {
    return this.isSame(other) ||
             other.constructor == knit.algebra.Join && 
  
             ((this.relationOne.isSame(other.relationOne) &&
              this.relationTwo.isSame(other.relationTwo)) ||
  
             (this.relationOne.isSame(other.relationTwo) &&
              this.relationTwo.isSame(other.relationOne))) &&

             this.predicate.isEquivalent(other.predicate)
  },
  
  split: function(){return this},
  merge: function(){return this},
  
  inspect: function(){
    var inspectStr = "join(" + this.relationOne.inspect() + "," + this.relationTwo.inspect()
    
    if (!this._predicateIsDefault()) {
      inspectStr += "," + this.predicate.inspect()
    }
    
    inspectStr += ")"
    return inspectStr
  }
})


knit.dslLocals.join = function(relationOne, relationTwo, predicate) {
  return new knit.algebra.Join(relationOne, relationTwo, predicate)
}

}, 
'knit/core': function(require, exports, module) {
if (!(typeof window === 'undefined')) global=window

require("knit/dsl_function")

global.knit = function(){
  this.algebra = {predicate:{}}
  this.engine = {}
  
  //hrm.  begone.
  this.engine.sql = {statement:{}}
  
  //see http://javascript.crockford.com/prototypal.html
  this.createObject = function() {
    var o = arguments[0]

    function F() {}
    F.prototype = o
    var newObj = new F()

    if (arguments.length==2) {
      var additions = arguments[1]
      _.extend(newObj, additions)
    }

    return newObj
  }
  
  return this
}.apply(new DSLFunction())
}, 
'knit/dsl_function': function(require, exports, module) {
//see http://alexyoung.org/2009/10/22/javascript-dsl/

DSLFunction = function() {
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
}


}, 
'knit/algebra/predicate': function(require, exports, module) {
require("knit/algebra/predicate/true_false")
require("knit/algebra/predicate/equality")
require("knit/algebra/predicate/conjunction")

}, 
'knit/algebra/predicate/true_false': function(require, exports, module) {
require("knit/core")
require("knit/algebra/predicate/equality")

knit.algebra.predicate.True = function() {
  return new knit.algebra.predicate.Equality(1,1)
}

knit.dslLocals.TRUE = new knit.algebra.predicate.True()


knit.algebra.predicate.False = function() {
  return new knit.algebra.predicate.Equality(1,2)
}

knit.dslLocals.FALSE = new knit.algebra.predicate.False()

}, 
'knit/algebra/predicate/equality': function(require, exports, module) {
require("knit/core")

knit.algebra.predicate.Equality = function(leftAtom, rightAtom) { //har
  this.leftAtom = leftAtom
  this.rightAtom = rightAtom
}

_.extend(knit.algebra.predicate.Equality.prototype, {
  _isAttribute: function(thing) {
    return thing.name
  },
  
  _attributesReferredTo: function() {
    var attributes = []
    if (this._isAttribute(this.leftAtom)) { 
      attributes.push(this.leftAtom)
    } 
    if (this._isAttribute(this.rightAtom)) { 
      attributes.push(this.rightAtom)
    } 
    return attributes
  },
  
  _attributesFromRelations: function(relations) {
    var attributesFromRelations = []
    _.each(relations, function(r){attributesFromRelations = attributesFromRelations.concat(r.attributes())})
    return attributesFromRelations
  },

  concernedWithNoOtherRelationsBesides: function() {
    var expectedExclusiveRelations = _.toArray(arguments)
     var argsForWithout = [this._attributesReferredTo()].concat(this._attributesFromRelations(expectedExclusiveRelations))
    return _.isEmpty(_.without.apply(this, argsForWithout))
  },
    
  concernedWithAllOf: function() {
    var expectedRelations = _.toArray(arguments)
    var myAttributes = this._attributesReferredTo()

    var self = this
    var expectedRelationsWithNotAttributesFoundHere = _.select(expectedRelations, function(relation){
      return _.isEmpty(_.intersect(relation.attributes(), myAttributes))
    })
  
    return _.isEmpty(expectedRelationsWithNotAttributesFoundHere)
  },
    

  _areTheseTwoThingsTheSame: function(a, b) {
    return a.isSame && b.isSame && a.isSame(b) || a == b
  },
  
  isSame: function(other) {  
    return other.constructor == knit.algebra.predicate.Equality && 
           this._areTheseTwoThingsTheSame(this.leftAtom, other.leftAtom) &&
           this._areTheseTwoThingsTheSame(this.rightAtom, other.rightAtom)
  },
  
  isEquivalent: function(other) {
    return this.isSame(other) ||
             other.constructor == knit.algebra.predicate.Equality && 
             this._areTheseTwoThingsTheSame(this.leftAtom, other.rightAtom) &&
             this._areTheseTwoThingsTheSame(this.rightAtom, other.leftAtom)
  },

  _inspectPrimitive: function(value) {
    if (this._isAttribute(value)) {
      return value.inspect()
    } else if (typeof value == "string") {
      return "'" + value + "'"
    } else {
      return "" + value
    }
  },
  
  inspect: function() {return "eq(" + this._inspectPrimitive(this.leftAtom) + "," + 
                                      this._inspectPrimitive(this.rightAtom) + ")" }
})

knit.dslLocals.equality = function(leftAtom, rightAtom) {
  return new knit.algebra.predicate.Equality(leftAtom, rightAtom)
}

knit.dslLocals.eq = knit.dslLocals.equality

}, 
'knit/algebra/predicate/conjunction': function(require, exports, module) {
require("knit/core")

knit.algebra.predicate.Conjunction = function(leftPredicate, rightPredicate) { //har
  this.leftPredicate = leftPredicate
  this.rightPredicate = rightPredicate
}

_.extend(knit.algebra.predicate.Conjunction.prototype, {
  
  concernedWithNoOtherRelationsBesides: function() {
    var expectedExclusiveRelations = _.toArray(arguments)
    return this.leftPredicate.concernedWithNoOtherRelationsBesides.apply(this.leftPredicate, expectedExclusiveRelations) &&
           this.rightPredicate.concernedWithNoOtherRelationsBesides.apply(this.rightPredicate, expectedExclusiveRelations)
  },
  
  concernedWithAllOf: function() {
    var expectedRelations = _.toArray(arguments)
    
    var self = this
    var remainingRelations = _.reject(expectedRelations, function(relation){
      return self.leftPredicate.concernedWithAllOf(relation) || self.rightPredicate.concernedWithAllOf(relation)
    })
  
    return _.isEmpty(remainingRelations)
  },
  
    
  isSame: function(other) {
    return other.constructor == knit.algebra.predicate.Conjunction && 
           this.leftPredicate.isSame(other.leftPredicate) &&
           this.rightPredicate.isSame(other.rightPredicate)
  },
  
  isEquivalent: function(other) {
    return this.isSame(other) ||
             other.constructor == knit.algebra.predicate.Conjunction && 
             this.leftPredicate.isEquivalent(other.rightPredicate) &&
             this.rightPredicate.isEquivalent(other.leftPredicate)
  },
  
  inspect: function() {return "and(" + this.leftPredicate.inspect() + "," + 
                                       this.rightPredicate.inspect() + ")" }
})

knit.dslLocals.conjunction = function(leftPredicate, rightPredicate) {
  return new knit.algebra.predicate.Conjunction(leftPredicate, rightPredicate)
}

knit.dslLocals.and = knit.dslLocals.conjunction

}, 
'knit/algebra/select': function(require, exports, module) {
require("knit/core")
require("knit/algebra/predicate")

knit.algebra.Select = function(relation, criteria) {
  this._attributes = relation.attributes()
  this.relation = relation
  this.criteria = criteria
}

_.extend(knit.algebra.Select.prototype, {
  attributes: function(){ return this._attributes },
  
  merge: function() {
    if (this.relation.criteria) {
      return knit(function(){
        return select(this.relation.relation.merge(), conjunction(this.relation.criteria, this.criteria))
      }, this)
    } else {
      return this
    }
  },
  
  split: function() {
    if (this.criteria instanceof knit.algebra.predicate.Conjunction) {
      return knit(function(){
        return select(
          select(this.relation.split(), this.criteria.leftPredicate),
          this.criteria.rightPredicate
        )
      }, this)
    } else {
      return this
    }
  },
  
  _doPush: function(relation) {
    return new knit.algebra.Select(relation, this.criteria).push()
  },
  
  push: function() {
    if (this.relation instanceof knit.algebra.Join) {
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
  },
  
  isSame: function(other) {
    return other instanceof knit.algebra.Select && 
           this.relation.isSame(other.relation) &&
           this.criteria.isSame(other.criteria)
  },
  
  isEquivalent: function(other) {
    if (other instanceof knit.algebra.Select) {
      var thisMerged = this.merge()
      var otherMerged = other.merge()
    
      return thisMerged.isSame(otherMerged) ||
               thisMerged.relation.isEquivalent(otherMerged.relation) &&
               thisMerged.criteria.isEquivalent(otherMerged.criteria)
    } else {
      return false
    }
  },
  
  inspect: function(){return "select(" + this.relation.inspect() + "," + this.criteria.inspect() + ")"}
})

knit.dslLocals.select = function(relation, criteria) {
  return new knit.algebra.Select(relation, criteria)
}

}, 
'knit/engine/memory': function(require, exports, module) {
require("knit/algebra")
require("knit/apply")

knit.engine.Memory = function() {
}

_.extend(knit.engine.Memory.prototype, {
  createRelation: function(name, attributeNames, primaryKey) {
    return new knit.engine.Memory.MutableRelation(name, attributeNames, primaryKey)
  }
})

require("knit/engine/memory/attribute")
require("knit/engine/memory/relation")
require("knit/engine/memory/predicate")
require("knit/engine/memory/standard_tuple_store")









}, 
'knit/apply': function(require, exports, module) {
require("knit/algebra")

_.extend(knit.algebra.Select.prototype, {
  apply: function() {
    return this.relation.apply().applySelect(this.criteria)
  }
})

_.extend(knit.algebra.Join.prototype, {
  apply: function() {
    var joinedRelation = this.relationOne.apply().applyJoin(this.relationTwo.apply(), this.predicate)
    joinedRelation._attributes = this._attributes
    return joinedRelation
  }
})

}, 
'knit/engine/memory/attribute': function(require, exports, module) {
knit.engine.Memory.Attribute = function(name, sourceRelation) {
  this.name = name
  this._sourceRelation = sourceRelation
}

_.extend(knit.engine.Memory.Attribute.prototype, {
  isSame: function(other) {
    return this.name == other.name &&
           this._sourceRelation === other._sourceRelation
  },
  
  inspect: function() {
    return this.name
  }

})

}, 
'knit/engine/memory/relation': function(require, exports, module) {
knit.engine.Memory.Relation = function(name, attributeNames, primaryKey, tuples, costSoFar) {
  this._name = name
  var self = this
  this._attributes = _.map(attributeNames, function(attr){
    return attr.name ? attr : new knit.engine.Memory.Attribute(attr, self)
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
  
  this._tupleStore = new knit.engine.Memory.StandardTupleStore(pkPositions, tuples || [])
  this.cost = costSoFar || 0
}

_.extend(knit.engine.Memory.Relation.prototype, {
  name: function(){ return this._name },
  attributes: function(){ return this._attributes },
  
  attr: function(attributeName) {
    return _.detect(this.attributes(), function(attr){return attr.name == attributeName})
  },
  
  isSame: function(other) {
    return this === other
  },

  inspect: function() {
    return this.name() + "[" + 
           _.map(this.attributes(), function(attr){return attr.inspect()}).join(",") + 
           "]" 
  },

  rows: function() {
    return this._tupleStore.rows()
  },
  
  objects: function() {
    var self = this
    return _.map(this._tupleStore.rows(), function(row){
      var object = {}
      _.each(row, function(value, columnPosition){
        var propertyName = self._attributes[columnPosition].name
        object[propertyName] = value
      })
      return object
    })
  },
  
  apply: function() {
    return this
  },
  
  _tupleWithAttributes: function(tuple, attributes) {
    var tupleWithAttributes = []
    for (var i=0; i<attributes.length; i++) {
      tupleWithAttributes.push([attributes[i], tuple[i]])
    }
    return tupleWithAttributes
  },
  
  _tuplesWithAttributes: function() {
    var self = this
    return _.map(this._tupleStore.rows(), function(tuple){
      return self._tupleWithAttributes(tuple, self.attributes())
    })
  },
  
  applySelect: function(criteria) {
    
    var matchingAttributesToTuples = 
      _.select(this._tuplesWithAttributes(), function(tupleWithAttributes){return criteria.match(tupleWithAttributes)})
    
    var matchingTuples = 
      _.map(matchingAttributesToTuples, 
            function(attributeToValueTuple){
              return _.map(attributeToValueTuple, function(attributeToValue){return attributeToValue[1]})
            })

    return this._newRelation(matchingTuples) 
  },

  applyJoin: function(relationTwo, predicate) {
    var tuples = this.rows()
    var otherTuples = relationTwo.rows()
    var combinedAttributes = [].concat(this.attributes()).concat(relationTwo.attributes())
    var joinTuples = []
    var self = this
    
    _.each(tuples, function(tuple){
      _.each(otherTuples, function(otherTuple){
        var candidateJoinTuple = [].concat(tuple).concat(otherTuple)
        if (predicate.match(self._tupleWithAttributes(candidateJoinTuple, combinedAttributes))) {
          joinTuples.push(candidateJoinTuple)
        }
      })
    })

    return this._newRelation(joinTuples, this.name() + "__" + relationTwo.name()) 
  },

  _newRelation: function(tuples, name) {
    var newName = name || this.name()
    
    //curry?
    return new knit.engine.Memory.Relation(newName, this.attributes(), this._pkAttributeNames, tuples, this.cost + tuples.length) 
  }
})

knit.engine.Memory.Relation.prototype.isEquivalent = knit.engine.Memory.Relation.prototype.isSame


knit.engine.Memory.MutableRelation = function(name, attributeNames, primaryKey) {
  return knit.createObject(new knit.engine.Memory.Relation(name, attributeNames, primaryKey), {
    merge: function(tuplesToAdd) {
      this._tupleStore.merge(tuplesToAdd)
      return this
    }
  })
}

}, 
'knit/engine/memory/predicate': function(require, exports, module) {
_.extend(knit.algebra.predicate.True.prototype, {
  match: function(attributeToValue) {
    return true
  }
})

_.extend(knit.algebra.predicate.False.prototype, {
  match: function(attributeToValue) {
    return false
  }
})

_.extend(knit.algebra.predicate.Equality.prototype, {
  _getValueForAttribute: function(attribute, attributeToValue) {
    var pair = _.detect(attributeToValue, function(pair){
      var attr = pair[0]
      var value = pair[1]
      return attr.isSame(attribute)
    })
    
    return pair ? pair[1] : null
  },
  
  _getValue: function(atom, attributeToValue) {
    return this._isAttribute(atom) ? this._getValueForAttribute(atom, attributeToValue) : atom
  },
  
  match: function(attributeToValue) {
    var left = this._getValue(this.leftAtom, attributeToValue)
    var right = this._getValue(this.rightAtom, attributeToValue)
    return left == right
  }
})

_.extend(knit.algebra.predicate.Conjunction.prototype, {
  match: function(attributeToValue) {
    return this.leftPredicate.match(attributeToValue) && this.rightPredicate.match(attributeToValue)
  }  
})

}, 
'knit/engine/memory/standard_tuple_store': function(require, exports, module) {
knit.engine.Memory.StandardTupleStore = function(keyColumns, initialTuples) {
  this._keyColumns = keyColumns
  this._tuples = initialTuples || []
}

_.extend(knit.engine.Memory.StandardTupleStore.prototype, {
  merge: function(moreTuples) {
    
    var self = this
    
    function hasKey() {
      return self._keyColumns.length >= 1
    }
    
    function treatAsSet(moreTuples) {
      //pretty bad perf...
        //future...cost-aware array?
        //test-drive to lower cost...
        //this._tuples.with(function(arr){
        //   ...tracks cost of all iterating you do in here  
        //})
        //
        //Also, cost-aware map
          //check out js map
      var keyToTuple = {}
      var keyToArrayIndex = {}
      
      _.each(self._tuples, function(tuple, i){
        var key = _.map(self._keyColumns, function(arrayIndex){return "" + tuple[arrayIndex]}).join("_")
        keyToTuple[key] = tuple
        keyToArrayIndex[key] = i
      })
    
      _.each(moreTuples, function(newTuple){
        var newKey = _.map(self._keyColumns, function(arrayIndex){return "" + newTuple[arrayIndex]}).join("_")
        if (keyToTuple[newKey]) {
          var i = keyToArrayIndex[newKey]
          self._tuples[i] = newTuple
        } else {
          self._tuples.push(newTuple)
        }
      })
    }
    
    if (hasKey()) {
      treatAsSet(moreTuples)
    } else {
      self._tuples = self._tuples.concat(moreTuples)
    }
  },
  
  rows: function(){ return this._tuples }
})
}
});
require.ensure(['knit/algebra', 'knit/engine/memory'], function() {
require("knit/algebra")
require("knit/engine/memory")
});
})();
