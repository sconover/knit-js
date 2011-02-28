var _ = require("knit/core/util")

module.exports.predicate = _.extend({},
                                    require("knit/algebra/predicate/equality"),
                                    require("knit/algebra/predicate/true_false"),
                                    require("knit/algebra/predicate/conjunction"))