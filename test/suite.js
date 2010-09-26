require(__dirname + "/test_helper.js");

files = jasmine.getAllSpecFiles(__dirname)
for (var i = 0, len = files.length; i < len; ++i){
  require(files[i]);
}

var exec = require('child_process').exec;
exec("sh -c 'cd lib && modulrize arel.js > ../arel-all.js'", function (error, stdout, stderr) {
  if (error !== null) {
    console.log('error creating arel-all.js, make sure you have modulr installed (gem install modulr): ' + error);
  }
});