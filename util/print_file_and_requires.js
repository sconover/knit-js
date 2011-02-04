var path = require('path')
var fs = require('fs')
var sys = require('sys')
var _ = require(path.join(__dirname, "../test/underscore"))


printFile = function(baseDir, f, alreadyReadIn) {
  var requireRegex = /^\s*require\((.*)?\)\s*$/
  
  alreadyReadIn.push(f)
  
  sys.debug(path.join(baseDir, f + ".js"))
  var printedHeader = false
  fs.readFileSync(path.join(baseDir, f + ".js")).
    toString().
    split('\n').
    forEach(function (line) { 
      if (line.match(requireRegex)) {
        var newFile = line.match(requireRegex)[1].replace(/["']/g, "")
        if (!_.include(alreadyReadIn, newFile)) {
          printFile(baseDir, newFile, alreadyReadIn)
        }
      } else {
        if (!printedHeader) {
          printedHeader = true
          sys.puts("\n\n//" + f + " ======================================================")
        }
        sys.puts(line)
      }
    })  
    
    sys.flush
}