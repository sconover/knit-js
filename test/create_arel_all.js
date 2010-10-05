var exec = require('child_process').exec
exec("sh -c 'cd lib && modulrize arel.js > ../arel-all.js'", function (error, stdout, stderr) {
  if (error !== null) {
    console.log('error creating arel-all.js, make sure you have modulr installed (gem install modulr): ' + error)
  }
})