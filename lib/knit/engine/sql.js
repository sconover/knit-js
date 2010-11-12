require("knit/core")
require("knit/engine/sql/types")
require("knit/engine/sql/statements")
require("knit/engine/sql/table")

knit.engine.Sql = function(db) {
  this._db = db
}

_.extend(knit.engine.Sql.prototype, {
  createRelation: function(name, attrDefs) {
    this._db.executeSync(new knit.engine.sql.statement.CreateTable(name, attrDefs))
    return new knit.engine.sql.Table(name, this._db)
  },
})
