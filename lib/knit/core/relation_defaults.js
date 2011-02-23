knit.mixin.relationDefaults = function(proto) {
  proto.compile = function(compiler){
    compiler = compiler || this.defaultCompiler()
    return compiler(this)
  }
  
  proto.split = 
    proto.merge = function(){return this}
  
}