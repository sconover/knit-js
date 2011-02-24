require("knit/core")

require("test_relation")

FakeTable = function() {
  var _ = knit._util,
      C = function(name, attributeNamesAndTypes) {
            this._testRelation = new TestRelation(attributeNamesAndTypes)
            this._testRelation.name = function(){return name}
    
            var self = this
            this.name = function(){return self._testRelation.name()}
          },
      p = C.prototype
  
  _.each(["id", "attributes", "attr", "isSame", "isEquivalent", "split", "merge", "newNestedAttribute"], 
          function(methodName){
            p[methodName] = function() {
              return this._testRelation[methodName].apply(this._testRelation, _.toArray(arguments))
            }
          })
  p.columns = p.attributes
  
  p.inspect = function() { return this.name() + "[" + this.attributes().inspect() + "]" }
  
  return C
}()