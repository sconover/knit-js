var path = require('path')
var fs = require('fs')
var sys = require('sys')
require(path.join(__dirname, "../lib/vendor/collection_functions"))
var _ = CollectionFunctions.Array.functions

function getExamples() {
  var examples = {}
  
  var currentExampleName = null
  var currentExampleString = ""
  
  fs.readFileSync("test/readme_includes_sqlite_test.js").
    toString().
    split('\n').
    forEach(function(line) { 

      if (line.match(/^  \}\)/)) {
        if (currentExampleName) {
          examples[currentExampleName] = currentExampleString
          currentExampleName = null
          currentExampleString = ""
        }
      }
      
      if (currentExampleName && 
          !line.match(/omit/) &&
          !line.match(/^\s*\/\*\s*$/) &&
          !line.match(/^\s*\*\/\s*$/) ) {
        currentExampleString += line.replace("/*", "  ").replace("*/", "  ") + "\n"
      }
      
      if (line.match(/^  test/)) {
        currentExampleName = line.replace('  test("', "").split('"')[0]
      }
      
      
    })  
  return examples
}

var readmeContents = fs.readFileSync("README.markdown.in").toString()
var examples = getExamples()
for (var exampleName in examples) {
  readmeContents = readmeContents.replace("<!-- EXAMPLE:" + exampleName + " -->", examples[exampleName])
}
sys.puts(readmeContents)
fs.writeFile("README.markdown", readmeContents, function(err){
  if(err) {
    sys.puts(err);
  } else {
    sys.puts("");
    sys.puts(">> WROTE README");
  }
})