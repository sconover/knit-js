require(__dirname + "/test_helper.js");

files = jasmine.getAllSpecFiles(__dirname)
for (var i = 0, len = files.length; i < len; ++i){
  require(files[i]);
}