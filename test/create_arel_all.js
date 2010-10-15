var exec = require('child_process').exec
exec("sh -c 'cd lib && modulrize knit.js > ../knit-all.js'", function (error, stdout, stderr) {
  if (error !== null) {
    console.log('error creating knit-all.js, make sure you have modulr installed (gem install modulr): ' + error)
  }
})