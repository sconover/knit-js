require.paths.push("test")
require.paths.push("lib")
require.paths.push("../node-sqlite")

require("underscore")

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


assert = require('assert')

assert.doubleEqual = assert.equal
assert.equal = assert.deepEqual

assert._func = function(func, expected, actual, orientation, term) {
  assert.ok(func(expected, actual)==orientation, 
            term + " failure: " + 
            "\n    expected: " + (expected.inspect ? expected.inspect() : "" + expected) + 
            "\n    actual:   " + (actual.inspect ? actual.inspect() : "" + actual))
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
  _.each(expected, function(item, i){
    assert.same(item, actual[i])
  })
}

