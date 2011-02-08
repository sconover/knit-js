require("knit/core")
require("knit/attributes")

require("test_relation")

FakeTable = function() {
  var _A = CollectionFunctions.Array.functions,
      _ = knit._util

  
  var F = function(name, attributeNames) {
    this._testRelation = new TestRelation(attributeNames)
    this._testRelation.name = function(){return name}
    
    var self = this
    this.name = function(){return self._testRelation.name()}
  }; var p = F.prototype
  
  _A.each(["id", "attributes", "attr", "isSame", "isEquivalent", "split", "merge", "newNestedAttribute"], 
          function(methodName){
            p[methodName] = function() {
              return this._testRelation[methodName].apply(this._testRelation, _A.toArray(arguments))
            }
          })
  
  p.inspect = function() { return this.name() + "[" + this.attributes().inspect() + "]" }
  
  return F
}()