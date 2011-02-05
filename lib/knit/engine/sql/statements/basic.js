require("knit/core")

knit.engine.sql.statement.Basic = function() {
}

knit._util.extend(knit.engine.sql.statement.Basic.prototype, {  
  modify: function(f){
    var modifyFunction = new DSLFunction()

    knit._util.extend(modifyFunction.dslLocals, this._dslLocals())
    
    modifyFunction(f)
    
    return this
  }
})
