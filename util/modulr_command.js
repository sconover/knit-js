var exec = require('child_process').exec

exports.modulrize = function(startingFile, allInOneFile) {
  exec("sh -c 'cd ../lib && modulrize " + startingFile + " > " + allInOneFile + "'", function (error, stdout, stderr) {
    if (error !== null) {
      console.log("error creating " + allInOneFile + ", make sure you have modulr installed (gem install modulr): " + error)
    }
  })  
}
