require("knit/algebra")

//this ; is one consequence of a semicolon-less js style.  hate me.
;(function(){
  
  var rowsAndObjects = {
    rows:function(){return this.apply().rows()},
    objects:function(){return this.apply().objects()}
  }
  
  _.extend(knit.algebra.Select.prototype, _.extend({
    apply: function() {
      return this.relation.apply().applySelect(this.criteria)
    }
  }, rowsAndObjects))

  _.extend(knit.algebra.Project.prototype, _.extend({
    apply: function() {
      return this.relation.apply().applyProject(this.attributes())
    }
  }, rowsAndObjects))

  _.extend(knit.algebra.Join.prototype, _.extend({
    apply: function() {
      var joinedRelation = this.relationOne.apply().applyJoin(this.relationTwo.apply(), this.predicate)
      joinedRelation._attributes = this._attributes
      return joinedRelation
    }
  }, rowsAndObjects))

  _.extend(knit.algebra.Order.prototype, _.extend({
    apply: function() {
      return this.relation.apply().applyOrder(this.orderAttribute, this.direction)
    }
  }, rowsAndObjects))

  _.extend(knit.algebra.Unnest.prototype, _.extend({
    apply: function() {
      return this.relation.apply().applyUnnest(this.nestedAttribute)
    }
  }, rowsAndObjects))

  _.extend(knit.algebra.Nest.prototype, _.extend({
    apply: function() {
      //impose order for now
      var relation = this.relation
      var forceOrderOnTheseAttributes = _.without(this.attributes(), this.nestedAttribute)
      while(forceOrderOnTheseAttributes.length > 0) {
        var orderByAttr = forceOrderOnTheseAttributes.shift()
        relation = new knit.algebra.Order(relation, orderByAttr, knit.algebra.Order.ASC)
      }
      
      return relation.apply().applyNest(this.nestedAttribute, this.attributes())
    }
  }, rowsAndObjects))

})()
