knit.translation.sql = function(){
  var _ = knit._util,
      Wildcard = function(){},
      Column = function(name){this.name = name},
      Join = function(left, right, predicate){this.left = left; this.right = right; this.predicate = predicate},
      Order = function(column, direction){this.column = column; this.direction = direction},
      predicate = {
        Equals: function(left, right){this.left = left; this.right = right},
        And: function(left, right){this.left = left; this.right = right}
      }
      
  Order.ASC = "asc"
  Order.DESC = "desc"
  
  var Select = function() {
    var F = function(){
          this._whats = []
          this._froms = []
          this._joins = []
          this._wheres = []
          this._orders = []
        },
        p = F.prototype
    
    p.columns = 
      p.attributes = function(){ 
        var allAttributes = new knit.Attributes([])
        _.each(this._froms, function(tableMapping) {
          var table = _.values(tableMapping)[0]
          allAttributes = allAttributes.concat(table.columns())
        })
        return allAttributes
      }
    p.merge = 
      p.split = function(){return this}
    p.newNestedAttribute = function(){throw("unsupported")}
    p.isSame = 
      p.isEquivalent = function(other){ return _.deepSame(this._froms, other._froms) }
    
    _.each(["what", "from", "join", "where", "order"], function(appenderMethodName){
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