require("knit/core")

knit.Rename = function(thingToRename, newName){
  _.extend(this, thingToRename)
  this.name = function(){return newName}
}