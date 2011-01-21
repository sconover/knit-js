require("knit/core")

knit.mixin.RowsAndObjects = function(proto) {
  proto.rows = function(){return this.perform().rows()}
  proto.objects = function(){return this.perform().objects()}
}