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

global.d = function(str) {
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
  
  target.$K = knit.createBuilderFunction({bindings:{
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




var librarypp = jasmine.pp

jasmine.pp = function(value) {
  var result = null
  if (typeof value.inspect == "function") {
    try {
      result = value.inspect()
    } catch (e) {
      //ignore
    }
  } 
  if (result === null) result = librarypp(value)  
  return result
};


jasmine.Matchers.prototype.toDeepEqual = function(expected) {
  return deepEqual(expected, this.actual)
}

assert.equal = function(expected, actual){
  expect(expected).toDeepEqual(actual) 
}


jasmine.Matchers.prototype.toBeTheEquivalentSetOf = function(expectedArray) {
  
  var equalityFunction = function(a,b){return deepEqual(a,b)}
  
  var expectedSet = new HashSet(undefined, equalityFunction)
  expectedSet.addAll(expectedArray)  
  
  var actualSet = new HashSet(undefined, equalityFunction)
  actualSet.addAll(this.actual)
    
  var intersectionSize = expectedSet.intersection(actualSet).size()
  return intersectionSize==actualSet.size() && intersectionSize==expectedSet.size()
}

assert.setsEqual = function(expectedArray, actualArray) {
  expect(expectedArray).toBeTheEquivalentSetOf(actualArray)
}



jasmine.Matchers.prototype.toBeTheEquivalentOf = function(expected) {
  return expected.isEquivalent(this.actual)
}

assert.equivalent = function(expected, actual) {
  expect(expected).toBeTheEquivalentOf(actual)
}

assert.notEquivalent = function(expected, actual) {
  expect(expected).not.toBeTheEquivalentOf(actual)
}



jasmine.Matchers.prototype.toBeTheSameAs = function(expected) {
  return this.actual.isSame(expected) // err umm we have a directionality problem.  solve later
}

assert.same = function(expected, actual) {
  expect(expected).toBeTheSameAs(actual)
}

assert.notSame = function(expected, actual) {
  expect(expected).not.toBeTheSameAs(actual)
}





assert._func = function(func, expected, actual, orientation, term, additionalMessageFunction) {
  var _ = knit._util
  
  additionalMessageFunction = additionalMessageFunction || function(){return ""}
  var result = func(expected, actual)==orientation
  assert.ok(result, 
            !result &&
            term + " failure: " + 
            "\n    expected: " + doInspect(expected) + 
            "\n    actual:   " + doInspect(actual) + 
            additionalMessageFunction(expected, actual))    
  
}



jasmine.Matchers.prototype.toBeDeepSameAs = function(expected) {
  return knit._util.deepSame(this.actual, expected) // err umm we have a directionality problem.  solve later
}

assert.deepSame = function(expected, actual) {
  expect(expected).toBeDeepSameAs(actual)
}



jasmine.Matchers.prototype.toQuackLike = function(expectedSignature) {
  return knit._util.quacksLike(this.actual, expectedSignature)
}

assert.quacksLike = function(actualObject, expectedSignature) {
  expect(actualObject).toQuackLike(expectedSignature)
}



assert.xquacksLike = function(actualObject, expectedSignature) {
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
