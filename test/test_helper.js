require.paths.push("test");
require.paths.push("lib");

require("../../jasmine-node/lib/jasmine");

jasmine.Env.prototype.regarding = jasmine.Env.prototype.describe;
jasmine.Env.prototype.xregarding = jasmine.Env.prototype.xdescribe;

jasmine.Env.prototype.test = jasmine.Env.prototype.it;
jasmine.Env.prototype.xtest = jasmine.Env.prototype.xit;

regarding = describe;
xregarding = xdescribe;
test = it;
xtest = xit;

var sys = require('sys');

global["d"] = function(str) {
  sys.puts(str);
};

for(var key in jasmine) {
  global[key] = jasmine[key];
}


assert = require('assert');

assert.equal = function equal(actual, expected, message) {
  if (!_.isEqual(actual, expected)) assert.fail(actual, expected, message, "==", assert.equal);
};


