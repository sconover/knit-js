knit.translation.sql = function(){
  var _ = knit._util,
      Wildcard = function(){},
      Join = function(left, right, predicate){this.left = left; this.right = right; this.predicate = predicate},
      Order = function(column, direction){this.column = column; this.direction = direction},
      predicate = {
        Equals: function(left, right){this.left = left; this.right = right},
        And: function(left, right){this.left = left; this.right = right}
      }
  
  Order.ASC = "asc"
  Order.DESC = "desc"
  
  var Column = function(name){
    this.name = name
    var parts = name.split(".")
    this.disambiguatingName = parts[0] + "$$" + parts[1]
  }
  Column.fromAttribute = function(attr) { return new Column(attr.sourceRelation().name() + "." + attr.name()) }
  
  var Select = function() {
    var F = function(){
          this._whats = []
          this._suppliedWhats = []
          this._froms = []
          this._joins = []
          this._wheres = []
          this._orders = []
        },
        p = F.prototype
    
    p.clone = function() {
      var clone = new F()
      for (var key in this) if (typeof clone[key] != "function") clone[key] = _.clone(this[key])
      return clone
    }
    
    p._allTables = function() {
      return _.uniq(_.concat(this._froms, _.flatten(_.map(this._joins, function(join){return [join.left, join.right]}))))
    }
    
    p.columns = 
      p.attributes = function(){ 
        var self = this
        return new knit.Attributes(_.map(this._whats, function(sqlColumn){
          var parts = sqlColumn.name.split("."),
              tableName = parts[0],
              attributeName = parts[1],
              table = _.detect(self._allTables(), function(table){return table.name() == tableName})
          return table.attr(attributeName)
        }))
      }
    p.merge = 
      p.split = function(){return this}
    p.newNestedAttribute = function(){throw("unsupported")}
    p.isSame = 
      p.isEquivalent = function(other){ return _.deepSame([this._whats, this._froms, this._wheres],
                                                          [other._whats, other._froms, other._wheres])}
    
    p._resetWhats = function() {
      var self = this
      function allColumnsFromFromsAndJoins() {
        var allColumns = new knit.Attributes([])
        _.each(self._allTables(), function(table) {
          allColumns = allColumns.concat(table.attributes())
        })
        return allColumns
      }
      
      if (_.empty(this._suppliedWhats)) {
        this._whats = allColumnsFromFromsAndJoins().map(function(col){return Column.fromAttribute(col)})
      } else {
        this._whats = this._suppliedWhats
      }
    }
    
    p.what = function() {
      this._suppliedWhats = _.flatten(this._suppliedWhats.concat(_.toArray(arguments)))
      this._resetWhats()
      return this
    }
    
    p.from = function() {
      this._froms = _.flatten(this._froms.concat(_.toArray(arguments)))
      this._resetWhats()
      return this
    }
    
    p.join = function() {
      this._joins = _.flatten(this._joins.concat(_.toArray(arguments)))
      this._resetWhats()
      return this
    }
    
    _.each(["where", "order"], function(appenderMethodName){
      var localName = "_" + appenderMethodName + "s"
      p[appenderMethodName] = 
        function(){ this[localName] = _.flatten(this[localName].concat(_.toArray(arguments))); return this }
    })
    
    return F
  }()
  
  return {Select:Select, 
          Column:Column, Wildcard:Wildcard, 
          Join:Join,
          predicate:predicate,
          Order:Order}
}()