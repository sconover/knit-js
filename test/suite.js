require(__dirname + "/test_helper.js");

var isVerbose = false;
var showColors = true;

jasmine.executeSpecsInFolder(__dirname, function(runner, log){
  process.exit(runner.results().failedCount);
}, isVerbose, showColors);