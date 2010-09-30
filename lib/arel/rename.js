require("arel/core");

arel.Rename = function(thingToRename, newName){
  _.extend(this, thingToRename);
  this.name = function(){return newName;};
};