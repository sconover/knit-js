require("./helper")

var allSpecs = 
  jasmine.getAllSpecFiles(__dirname, "_engine.js").concat(
    jasmine.getAllSpecFiles(__dirname, "_test.js")
  )
var mainSpecs = []
for (var i=0; i<allSpecs.length; i++) if (allSpecs[i].indexOf("sqlite")<0) require(allSpecs[i])

knit.engine.sqlite.Connection = function(){throw new Error("should not load sqlite stuff at all in the main suite")}