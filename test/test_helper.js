load("test/jasmine.js");

// var regarding = describe;
// var xregarding = xdescribe;
// 
// jasmine.Env.prototype.regarding = jasmine.Env.prototype.describe;
// jasmine.Env.prototype.xregarding = jasmine.Env.prototype.xdescribe;

jasmine.Env.prototype.test = jasmine.Env.prototype.it
jasmine.Env.prototype.xtest = jasmine.Env.prototype.xit