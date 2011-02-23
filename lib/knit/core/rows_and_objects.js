knit.mixin.RowsAndObjects = function(proto) {
  proto.rows = function(){return this.rows()}
  proto.objects = function(){return this.objects()}
}