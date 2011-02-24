//Table quacksLike relation
knit.engine.sqlite.Table = function() {
  var _ = knit._util,
      C = function(name, columnInformation, db) {
            this._name = name
            var self = this
            this._columns = new knit.Attributes(_.map(columnInformation, function(columnInfo){
              return new knit.engine.sqlite.Column(columnInfo, self)
            }))
            this._db = db
          },
      p = C.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.name = function(){ return this._name }
  p.columns = 
    p.attributes = function(){ return this._columns }
  p.attr = function() { return this.attributes().get(_.toArray(arguments)) }
  p.split = function(){return this}
  
  p.compile = function() { return this.defaultCompiler()(this) }
  p.defaultCompiler = function() { return knit.engine.sqlite.Query.expressionCompiler(this._db) }
  p.toSql = function(statementInProgress) {
    statementInProgress = statementInProgress || new knit.translation.sql.Select()
    statementInProgress.from(this)
    return statementInProgress
  }
  
  p.newNestedAttribute = function(){ throw("nested attributes not supported") }
  
  p.isSame = 
    p.isEquivalent = function(other){
      return other.constructor == C &&
             this._name == other._name &&
             this._columns.isSame(other._columns)
    }
  
  p.objects = function() { return this.defaultCompiler()(this).objects() }
  p.rows = function() { return this.defaultCompiler()(this).rows() }
    
  p.merge = function(rows) {
    var self = this,
        sql = "insert or replace into " + this._name + 
              " values(" + _.repeat(["?"], this.columns().size()).join(",") + ")"
    _.each(rows, function(row){
      self._db.execute({sql:sql, values:row})
    })
    return this
  }
  
  p.inspect = function() { return this.name() + "[" + this.attributes().inspect() + "]" }
  
  C.load = function(db, name) {
    var columnInformation = db.columnInformation(name)
    return new C(name, columnInformation, db)
  }
  
  C.create = function(db, name, attributeNamesAndTypes, primaryKey) {
    primaryKey = primaryKey || []
    function attributeNamesAndTypesToColumnDefinitions(attributeNamesAndTypes) {
      return _.map(attributeNamesAndTypes, function(attributeNameAndType){
        var columnName = attributeNameAndType[0]
        var attributeType = attributeNameAndType[1]
        return columnName + " " + knit.engine.sqlite.ATTRIBUTE_TYPE_TO_SQLITE_COLUMN_TYPE[attributeType] + 
                                    (_.include(primaryKey, columnName) ? " primary key" : "")
      })
    }
    
    db.execute({sql:"create table " + name + 
                    " (" + attributeNamesAndTypesToColumnDefinitions(attributeNamesAndTypes).join(", ") + ")"})

    return C.load(db, name)
  }
  
  return C
}()
