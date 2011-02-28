require("knit/core")
var _ = require("knit/core/util")

_.extend(knit.algebra, 
         require("knit/algebra/divide"),
         require("knit/algebra/join"),
         require("knit/algebra/nest_unnest"),
         require("knit/algebra/rename"),
         require("knit/algebra/select"),
         require("knit/algebra/project"),
         require("knit/algebra/order"),
         require("knit/algebra/predicate"))

_.each(_.values(knit.algebra).concat(_.values(knit.algebra.predicate)), function(constructor) {
  if (constructor.dslLocals) _.extend(knit.createBuilderFunction.dslLocals, constructor.dslLocals)
})
