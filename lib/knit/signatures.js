knit.signature = function(){
  var like = {
    isSame:Function, 
    isEquivalent:Function
  }
  
  var signatures = {}
  
  signatures.attribute = _.extend({
    name:Function, 
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
  
  signatures.join = _.extend({
    relationOne:Object, 
    relationTwo:Object, 
    predicate:Object}, 
    signatures.relation
  )

  return signatures
}()
