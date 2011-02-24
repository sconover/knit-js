require.paths.push("test")
require.paths.push("lib")
require.paths.push("../node-sqlite")

require("../../jasmine-node/lib/jasmine")
require("vendor/jshashtable")
require("vendor/jshashset")
require("./vendor/deep_equal")

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


setupPersonHouseCity = function(target, createRelation) {
  createRelation = createRelation || function(name, attributeNamesAndTypes){return new TestRelation(attributeNamesAndTypes)}
  
  target.person = createRelation("person", [["personId", knit.attributeType.Integer], 
                                            ["houseId", knit.attributeType.Integer], 
                                            ["name", knit.attributeType.String], 
                                            ["age", knit.attributeType.String]], ["personId"])
  target.house = createRelation("house", [["houseId", knit.attributeType.Integer], 
                                          ["address", knit.attributeType.String], 
                                          ["cityId", knit.attributeType.Integer]], ["houseId"])
  target.city = createRelation("city", [["cityId", knit.attributeType.Integer], 
                                        ["name", knit.attributeType.String]], ["cityId"])  
  
  target.$R = knit.createBuilderFunction({bindings:{
    person:target.person,
    house:target.house,
    city:target.city
  }})    
  
}

assert = require('assert')

var formatFunction = require("./vendor/format_from_node_console")
assert.AssertionError.prototype.originalToString = assert.AssertionError.prototype.toString
assert.AssertionError.prototype.toString = function() {
  try {
    return this.originalToString()
  } catch(e) {
    console.log("Error in AssertionError#toString()")
    console.log("\nEXPECTED:\n")
    console.log(this.expected)
    console.log("\nACTUAL:\n")
    console.log(this.actual)
    return ""
  }
  
  // var str = this.originalToString()
  // if (str.indexOf("Converting circular structure to JSON")>=0) {
  //   console.log("error detected, expected inspect: ", this.expected)
  //   console.log("error detected, actual inspect: ", this.actual)
  // }
  // 
  
  return this.originalToString() + "\nEXPECTED:\n" + formatFunction.format(this.expected) + "\n\nACTUAL:\n" + formatFunction.format(this.actual)
}

assert.doubleEqual = assert.equal
assert.equal = assert.deepEqual

assert._func = function(func, expected, actual, orientation, term, additionalMessageFunction) {
  var _ = knit._util
  
  function simpleInspect(obj) {
    if (typeof obj == "object") {
      return "{" + _.map(_.keys(obj).sort(), function(key){return "" + key + "=" + obj[key]}).join(" ") + "}"
    } else {
      return "" + obj
    }
  }
  
  function doInspect(obj) {
    if (obj.inspect) {
      return obj.inspect()
    } else if (obj.push && obj.length) {
      return knit._util.inspect(obj)
    } else {
      simpleInspect(obj)
    }
  }
  
  additionalMessageFunction = additionalMessageFunction || function(){return ""}
  var result = func(expected, actual)==orientation
  assert.ok(result, 
            !result &&
            term + " failure: " + 
            "\n    expected: " + doInspect(expected) + 
            "\n    actual:   " + doInspect(actual) + 
            additionalMessageFunction(expected, actual))    
  
}

assert.setsEqual = function(expectedArray, actualArray) {
  var equalityFunction = function(a,b){return deepEqual(a,b)}
  
  var expectedSet = new HashSet(undefined, equalityFunction)
  expectedSet.addAll(expectedArray)  
  
  var actualSet = new HashSet(undefined, equalityFunction)
  actualSet.addAll(actualArray)
  assert._func(
    function(expected, actual){
      var intersectionSize = expectedSet.intersection(actualSet).size()
      return intersectionSize==actualSet.size() && intersectionSize==expectedSet.size()
    }, 
    expectedArray, 
    actualArray, 
    true, 
    "is Set-Equal",
    function(){
      var intersection = expectedSet.intersection(actualSet)
      return "\nexpected-actual=" + knit._util.inspect(knit._util.differ(expectedArray, intersection.values())) +
             "\nactual-expected=" + knit._util.inspect(knit._util.differ(actualArray, intersection.values()))
    })
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

assert.deepSame = function(expected, actual) {
  assert._func(function(expected, actual){return knit._util.deepSame(expected, actual)}, expected, actual, true, "is Deep Same")
}

assert.quacksLike = function(actualObject, expectedSignature) {
  assert._func(function(expectedSignature, actualObject){return knit._util.quacksLike(actualObject, expectedSignature)}, 
               expectedSignature, 
               actualObject, 
               true, 
               "Quacks Like")
}

assert.doesntQuackLike = function(actualObject, expectedSignature) {
  assert._func(function(expectedSignature, actualObject){return knit._util.quacksLike(actualObject, expectedSignature)}, 
               expectedSignature, 
               actualObject, 
               false, 
               "Doesn't Quack Like")
}
