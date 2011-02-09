require("knit/core")
require("knit/engine/sqlite/types")
require("knit/engine/sqlite/statements")
require("knit/engine/sqlite/table")

knit.engine.Sql = function(db) {
  this._db = db
}

knit._util.extend(knit.engine.Sql.prototype, {
  this.createRelation: function(name, attrDefs) {
    this._db.executeSync(new knit.engine.sql.statement.CreateTable(name, attrDefs))
    return new knit.engine.sql.Table(name, this._db)
  },
})
