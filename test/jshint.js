require.paths.push("../jshint")
var fs = require("fs")
var sys = require("sys")
require("../lib/vendor/collection_functions.js")
var JSHINT = require("jshint.js").JSHINT;
var _ = CollectionFunctions.Array.functions


function allFiles(rootDir) {
  var files = []
  _.each(fs.readdirSync(rootDir), function(thing) {
    var path = rootDir + "/" + thing
    if (fs.statSync(path).isDirectory()) {
      files = files.concat(allFiles(path))
    } else {
      files.push(path)
    }
  })  
  return files
}

var files = allFiles("./lib/knit")

_.each(files, function(file) {
  var result = JSHINT(fs.readFileSync(file, "utf8"), {
                      
                      asi:true, // DRY statement termination, less code spam.  
                                // http://aresemicolonsnecessaryinjavascript.com/
                      
                      node:true, //we like node here
                      
                      evil:true, //dsl function uses eval
                      
                      forin:true, //while it's theoretically possible that we could be
                                  //considering unwanted prototype methods, mostly
                                  //we're doing this because the jsobjects are being
                                  //used as maps.  
                      
                      myGlobals:{knit:false} //no lint/hint code spam, ty very much
                      
                    })
  if (!result) {
    console.log("JSHINT failure: ", file)
    console.log(JSHINT.data().errors)
    process.exit(1)
  }
})