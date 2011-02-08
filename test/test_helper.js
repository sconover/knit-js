require.paths.push("test")
require.paths.push("lib")
require.paths.push("../node-sqlite")

require("../../jasmine-node/lib/jasmine")

jasmine.Env.prototype.regarding = jasmine.Env.prototype.describe
jasmine.Env.prototype.xregarding = jasmine.Env.prototype.xdescribe

jasmine.Env.prototype.test = jasmine.Env.prototype.it
jasmine.Env.prototype.xtest = jasmine.Env.prototype.xit

regarding = describe
xregarding = xdescribe
test = it
xtest = xit

var sys = require('sys')

global["d"] = function(str) {
  sys.puts(str)
}

for(var key in jasmine) {
  global[key] = jasmine[key]
}


setupPersonHouseCity = function(target, createRelationFunction) {
  target.person = createRelationFunction("person", ["personId", "houseId", "name", "age"])
  target.house = createRelationFunction("house", ["houseId", "address", "cityId"])
  target.city = createRelationFunction("city", ["cityId", "name"])  
  
  target.$R = knit.createBuilderFunction({bindings:{
    person:target.person,
    house:target.house,
    city:target.city
  }})    
  
}

assert = require('assert')

assert.doubleEqual = assert.equal
assert.equal = assert.deepEqual

assert._func = function(func, expected, actual, orientation, term) {
  var _A = CollectionFunctions.Array.functions,
      _ = knit._util
  
  function simpleInspect(obj) {
    if (typeof obj == "object") {
      return "{" + _A.map(_.keys(obj).sort(), function(key){return "" + key + "=" + obj[key]}).join(" ") + "}"
    } else {
      return "" + obj
    }
  }
  
  var result = func(expected, actual)==orientation
  assert.ok(result, 
            !result &&
            term + " failure: " + 
            "\n    expected: " + (expected.inspect ? expected.inspect() : simpleInspect(expected)) + 
            "\n    actual:   " + (actual.inspect ? actual.inspect() : simpleInspect(actual)))
}

assert._equivalent = function(expected, actual, orientation, term) {
  assert._func(function(expected, actual){return expected.isEquivalent(actual)}, expected, actual, orientation, term)
}

assert.equivalent = function(expected, actual) {
  assert._equivalent(expected, actual, true, "is Equivalent")
}

assert.notEquivalent = function(expected, actual) {
  assert._equivalent(expected, actual, false, "is Not Equivalent")
}

assert._same = function(expected, actual, orientation, term) {
  assert._func(function(expected, actual){return expected.isSame(actual)}, expected, actual, orientation, term)
}


assert.same = function(expected, actual) {
  assert._same(expected, actual, true, "is Same")
}

assert.notSame = function(expected, actual) {
  assert._same(expected, actual, false, "is Not Same")
}


assert.arraySame = function(expected, actual) {
  CollectionFunctions.Array.functions.each(expected, function(item, i){
    assert.same(item, actual[i])
  })
}

assert.quacksLike = function(actualObject, expectedSignature) {
  assert._func(function(expectedSignature, actualObject){return knit.quacksLike(actualObject, expectedSignature)}, 
               expectedSignature, 
               actualObject, 
               true, 
               "Quacks Like")
}

assert.doesntQuackLike = function(actualObject, expectedSignature) {
  assert._func(function(expectedSignature, actualObject){return knit.quacksLike(actualObject, expectedSignature)}, 
               expectedSignature, 
               actualObject, 
               false, 
               "Doesn't Quack Like")
}
