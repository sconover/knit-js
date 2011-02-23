knit.mixin.RowsAndObjects = function(proto) {
  proto.compile = function(compiler){
    compiler = compiler || this.defaultCompiler()
    return compiler(this)
  }
  proto.rows = function(){return this.rows()}
  proto.objects = function(){return this.objects()}
}