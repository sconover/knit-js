var path = require("path")
var sys = require('sys')
var exec = require('child_process').exec

function buildFile(fromScript, outputFile) {
  var toRun = path.join(__dirname, fromScript)
  var toPath = path.join(__dirname, "..", outputFile)
  
  var cmd = "node " + toRun + " > " + toPath
  sys.debug(cmd)
  exec(cmd, function (error, stdout, stderr) {
    if (error !== null) {
      console.log("error creating " + allInOneFile + ": " + error)
    }
  })  
  
}


buildFile("print_algebra.js", "knit_algebra.js")
buildFile("print_memory.js", "knit_memory.js")