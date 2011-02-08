if (!(typeof window === 'undefined')) global=window

require("vendor/collection_functions")

global.knit = {
  algebra: {predicate:{}},
  mixin:{},
  translation:{sql:{}},
  engine:{  /*hrm.  begone.*/ sql:{statement:{}}  }
}

require("knit/util")
require("knit/quacks_like")
require("knit/reference")
require("knit/rows_and_objects")
require("knit/signatures")
require("knit/builder_function")


