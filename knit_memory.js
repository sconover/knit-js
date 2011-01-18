
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









}, 
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
require("underscore")
require("knit/dsl_function")

global["knit"] = new DSLFunction()
global.knit.algebra = {}
global.knit.algebra.predicate = {}
global.knit.engine = {}
global.knit.engine.sql = {}
global.knit.engine.sql.statement = {}

knit.createObject = function() {
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


}, 
'underscore': function(require, exports, module) {
// Underscore.js
// (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore is freely distributable under the terms of the MIT license.
// Portions of Underscore are inspired by or borrowed from Prototype.js,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore

(function() {
  // ------------------------- Baseline setup ---------------------------------

  // Establish the root object, "window" in the browser, or "global" on the server.
  var root = this;

  // Save the previous value of the "_" variable.
  var previousUnderscore = root._;

  // Establish the object that gets thrown to break out of a loop iteration.
  var breaker = typeof StopIteration !== 'undefined' ? StopIteration : '__break__';

  // Quick regexp-escaping function, because JS doesn't have RegExp.escape().
  var escapeRegExp = function(s) { return s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1'); };

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice                 = ArrayProto.slice,
      unshift               = ArrayProto.unshift,
      toString              = ObjProto.toString,
      hasOwnProperty        = ObjProto.hasOwnProperty,
      propertyIsEnumerable  = ObjProto.propertyIsEnumerable;

  // All ECMA5 native implementations we hope to use are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for CommonJS.
  if (typeof exports !== 'undefined') exports._ = _;

  // Export underscore to global scope.
  root._ = _;

  // Current version.
  _.VERSION = '1.1.0';

  // ------------------------ Collection Functions: ---------------------------

  // The cornerstone, an each implementation.
  // Handles objects implementing forEach, arrays, and raw objects.
  // Delegates to JavaScript 1.6's native forEach if available.
  var each = _.forEach = function(obj, iterator, context) {
    try {
      if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
      } else if (_.isNumber(obj.length)) {
        for (var i = 0, l = obj.length; i < l; i++) iterator.call(context, obj[i], i, obj);
      } else {
        for (var key in obj) {
          if (hasOwnProperty.call(obj, key)) iterator.call(context, obj[key], key, obj);
        }
      }
    } catch(e) {
      if (e != breaker) throw e;
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to JavaScript 1.6's native map if available.
  _.map = function(obj, iterator, context) {
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    var results = [];
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  // Reduce builds up a single result from a list of values, aka inject, or foldl.
  // Delegates to JavaScript 1.8's native reduce if available.
  _.reduce = function(obj, iterator, memo, context) {
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return obj.reduce(iterator, memo);
    }
    each(obj, function(value, index, list) {
      memo = iterator.call(context, memo, value, index, list);
    });
    return memo;
  };

  // The right-associative version of reduce, also known as foldr. Uses
  // Delegates to JavaScript 1.8's native reduceRight if available.
  _.reduceRight = function(obj, iterator, memo, context) {
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return obj.reduceRight(iterator, memo);
    }
    var reversed = _.clone(_.toArray(obj)).reverse();
    return _.reduce(reversed, iterator, memo, context);
  };

  // Return the first value which passes a truth test.
  _.detect = function(obj, iterator, context) {
    var result;
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        _.breakLoop();
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to JavaScript 1.6's native filter if available.
  _.filter = function(obj, iterator, context) {
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    var results = [];
    each(obj, function(value, index, list) {
      iterator.call(context, value, index, list) && results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    each(obj, function(value, index, list) {
      !iterator.call(context, value, index, list) && results.push(value);
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to JavaScript 1.6's native every if available.
  _.every = function(obj, iterator, context) {
    iterator = iterator || _.identity;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    var result = true;
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) _.breakLoop();
    });
    return result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to JavaScript 1.6's native some if available.
  _.some = function(obj, iterator, context) {
    iterator = iterator || _.identity;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    var result = false;
    each(obj, function(value, index, list) {
      if (result = iterator.call(context, value, index, list)) _.breakLoop();
    });
    return result;
  };

  // Determine if a given value is included in the array or object using '==='.
  _.include = function(obj, target) {
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    var found = false;
    each(obj, function(value) {
      if (found = value === target) _.breakLoop();
    });
    return found;
  };

  // Invoke a method with arguments on every item in a collection.
  _.invoke = function(obj, method) {
    var args = _.rest(arguments, 2);
    return _.map(obj, function(value) {
      return (method ? value[method] : value).apply(value, args);
    });
  };

  // Convenience version of a common use case of map: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum item or (item-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator = iterator || _.identity;
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return iterable;
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };

  // -------------------------- Array Functions: ------------------------------

  // Get the first element of an array. Passing "n" will return the first N
  // values in the array. Aliased as "head". The "guard" check allows it to work
  // with _.map.
  _.first = function(array, n, guard) {
    return n && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the first entry of the array. Aliased as "tail".
  // Especially useful on the arguments object. Passing an "index" will return
  // the rest of the values in the array from that index onward. The "guard"
   //check allows it to work with _.map.
  _.rest = function(array, index, guard) {
    return slice.call(array, _.isUndefined(index) || guard ? 1 : index);
  };

  // Get the last element of an array.
  _.last = function(array) {
    return array[array.length - 1];
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(_.flatten(value));
      memo.push(value);
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    var values = _.rest(arguments);
    return _.filter(array, function(value){ return !_.include(values, value); });
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  _.uniq = function(array, isSorted) {
    return _.reduce(array, function(memo, el, i) {
      if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) memo.push(el);
      return memo;
    }, []);
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersect = function(array) {
    var rest = _.rest(arguments);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = _.toArray(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, String(i));
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, MSIE),
  // we need this function. Return the position of the first occurence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to JavaScript 1.8's native indexOf if available.
  _.indexOf = function(array, item) {
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (var i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
    return -1;
  };


  // Delegates to JavaScript 1.6's native lastIndexOf if available.
  _.lastIndexOf = function(array, item) {
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python range() function. See:
  // http://docs.python.org/library/functions.html#range
  _.range = function(start, stop, step) {
    var a     = _.toArray(arguments);
    var solo  = a.length <= 1;
    var start = solo ? 0 : a[0], stop = solo ? a[0] : a[1], step = a[2] || 1;
    var len   = Math.ceil((stop - start) / step);
    if (len <= 0) return [];
    var range = new Array(len);
    for (var i = start, idx = 0; true; i += step) {
      if ((step > 0 ? i - stop : stop - i) >= 0) return range;
      range[idx++] = i;
    }
  };

  // ----------------------- Function Functions: ------------------------------

  // Create a function bound to a given object (assigning 'this', and arguments,
  // optionally). Binding with arguments is also known as 'curry'.
  _.bind = function(func, obj) {
    var args = _.rest(arguments, 2);
    return function() {
      return func.apply(obj || {}, args.concat(_.toArray(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = _.rest(arguments);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher = hasher || _.identity;
    return function() {
      var key = hasher.apply(this, arguments);
      return key in memo ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = _.rest(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(_.rest(arguments)));
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(_.toArray(arguments));
      return wrapper.apply(wrapper, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = _.toArray(arguments);
    return function() {
      var args = _.toArray(arguments);
      for (var i=funcs.length-1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // ------------------------- Object Functions: ------------------------------

  // Retrieve the names of an object's properties.
  // Delegates to ECMA5's native Object.keys
  _.keys = nativeKeys || function(obj) {
    if (_.isArray(obj)) return _.range(0, obj.length);
    var keys = [];
    for (var key in obj) if (hasOwnProperty.call(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  _.functions = function(obj) {
    return _.filter(_.keys(obj), function(key){ return _.isFunction(obj[key]); }).sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(_.rest(arguments), function(source) {
      for (var prop in source) obj[prop] = source[prop];
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (_.isArray(obj)) return obj.slice(0);
    return _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    // Check object identity.
    if (a === b) return true;
    // Different types?
    var atype = typeof(a), btype = typeof(b);
    if (atype != btype) return false;
    // Basic equality test (watch out for coercions).
    if (a == b) return true;
    // One is falsy and the other truthy.
    if ((!a && b) || (a && !b)) return false;
    // One of them implements an isEqual()?
    if (a.isEqual) return a.isEqual(b);
    // Check dates' integer values.
    if (_.isDate(a) && _.isDate(b)) return a.getTime() === b.getTime();
    // Both are NaN?
    if (_.isNaN(a) && _.isNaN(b)) return false;
    // Compare regular expressions.
    if (_.isRegExp(a) && _.isRegExp(b))
      return a.source     === b.source &&
             a.global     === b.global &&
             a.ignoreCase === b.ignoreCase &&
             a.multiline  === b.multiline;
    // If a is not an object by this point, we can't handle it.
    if (atype !== 'object') return false;
    // Check for different array lengths before comparing contents.
    if (a.length && (a.length !== b.length)) return false;
    // Nothing else worked, deep compare the contents.
    var aKeys = _.keys(a), bKeys = _.keys(b);
    // Different object sizes?
    if (aKeys.length != bKeys.length) return false;
    // Recursive comparison of contents.
    for (var key in a) if (!(key in b) || !_.isEqual(a[key], b[key])) return false;
    return true;
  };

  // Is a given array or object empty?
  _.isEmpty = function(obj) {
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return !!(obj && obj.concat && obj.unshift && !obj.callee);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return obj && obj.callee;
  };

  // Is a given value a function?
  _.isFunction = function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return (obj === +obj) || (toString.call(obj) === '[object Number]');
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false;
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return !!(obj && obj.getTimezoneOffset && obj.setUTCFullYear);
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false));
  };

  // Is the given value NaN -- this one is interesting. NaN != NaN, and
  // isNaN(undefined) == true, so we make sure it's a number first.
  _.isNaN = function(obj) {
    return _.isNumber(obj) && isNaN(obj);
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return typeof obj == 'undefined';
  };

  // -------------------------- Utility Functions: ----------------------------

  // Run Underscore.js in noConflict mode, returning the '_' variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function n times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Break out of the middle of an iteration.
  _.breakLoop = function() {
    throw breaker;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    start       : '<%',
    end         : '%>',
    interpolate : /<%=(.+?)%>/g
  };

  // JavaScript templating a-la ERB, pilfered from John Resig's
  // "Secrets of the JavaScript Ninja", page 83.
  // Single-quote fix from Rick Strahl's version.
  // With alterations for arbitrary delimiters, and to preserve whitespace.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var endMatch = new RegExp("'(?=[^"+c.end.substr(0, 1)+"]*"+escapeRegExp(c.end)+")","g");
    var fn = new Function('obj',
      'var p=[],print=function(){p.push.apply(p,arguments);};' +
      'with(obj||{}){p.push(\'' +
      str.replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         .replace(endMatch,"✄")
         .split("'").join("\\'")
         .split("✄").join("'")
         .replace(c.interpolate, "',$1,'")
         .split(c.start).join("');")
         .split(c.end).join("p.push('")
         + "');}return p.join('');");
    return data ? fn(data) : fn;
  };

  // ------------------------------- Aliases ----------------------------------

  _.each     = _.forEach;
  _.foldl    = _.inject       = _.reduce;
  _.foldr    = _.reduceRight;
  _.select   = _.filter;
  _.all      = _.every;
  _.any      = _.some;
  _.contains = _.include;
  _.head     = _.first;
  _.tail     = _.rest;
  _.methods  = _.functions;

  // ------------------------ Setup the OOP Wrapper: --------------------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = _.toArray(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      method.apply(this._wrapped, arguments);
      return result(this._wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

})();

}, 
'knit/dsl_function': function(require, exports, module) {
require("underscore")

//see http://alexyoung.org/2009/10/22/javascript-dsl/

DSLFunction = function() {
  var dslLocals = {}
  var outerFunction = function(userFunction, whatThisIsSupposedToBe){
    if (whatThisIsSupposedToBe == undefined) {
      whatThisIsSupposedToBe = this
    }
    
    var localNames = []
    var localValues = []
    _.each(_.keys(dslLocals), function(key){
      localNames.push(key)
      localValues.push(dslLocals[key])
    })
    
    var userFunctionBody = "(_.bind(" + userFunction.toString().replace(/\s+$/, "") + ",this))()"
    var wrappingFunctionBody = "(function(" + localNames.join(",") + "){return " + userFunctionBody + "})"
    return eval(wrappingFunctionBody).apply(whatThisIsSupposedToBe, localValues)
  }
  outerFunction.dslLocals = dslLocals
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

  all: function() {
    return this._tupleStore.all()
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
    return _.map(this._tupleStore.all(), function(tuple){
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
    var tuples = this.all()
    var otherTuples = relationTwo.all()
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

}
});
require.ensure(['knit/engine/memory'], function() {
require("knit/engine/memory")
});
})();
