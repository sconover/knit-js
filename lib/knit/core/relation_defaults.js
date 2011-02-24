knit.mixin.relationDefaults = function(target) {

  target.compile = function(compiler){
    compiler = compiler || this.defaultCompiler()
    return compiler(this)
  }
  
  target.split = 
    target.merge = function(){return this}
  
  target.toAlgorithm = function() {
    var self = this
    return function(){return self}
  }

}