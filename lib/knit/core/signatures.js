knit.signature = function(){
  var _ = knit._util
  
  var like = {
    isSame:Function, 
    isEquivalent:Function
  }
  
  var signatures = {}
  
  signatures.attribute = _.extend({
    name:Function, 
    type:Function, 
    sourceRelation:Function}, 
    like
  )
  
  signatures.nestedAttribute = _.extend({
    nestedRelation:Function}, 
    signatures.attribute
  )
  
  signatures.relation = _.extend({
    attributes:Function, 
    split:Function, 
    merge:Function, 
    newNestedAttribute:Function}, 
    like
  )
  
  signatures.executionStrategy = _.extend({
    rowsAsync:Function, 
    rowsSync:Function}, 
    signatures.relation
  )
  
  signatures.join = _.extend({
    relationOne:Object, 
    relationTwo:Object, 
    predicate:Object}, 
    signatures.relation
  )

  return signatures
}()
