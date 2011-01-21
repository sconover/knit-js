require("knit/core")

knit.mixin.RowsAndObjects = function(proto) {
  proto.rows = function(){return this.apply().rows()}
  proto.objects = function(){return this.apply().objects()}
}