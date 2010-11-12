require("knit/core")

knit.engine.sql.statement.Basic = function() {
}

_.extend(knit.engine.sql.statement.Basic.prototype, {  
  modify: function(f){
    var modifyFunction = new DSLFunction()

    _.extend(modifyFunction.dslLocals, this._dslLocals())
    
    modifyFunction(f)
    
    return this
  }
})
