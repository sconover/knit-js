knit.signature = function(){
  var _ = knit._util
  
  var inspectable = {inspect:Function},
      like = {isSame:Function, isEquivalent:Function},
      signatures = {}
  
  signatures.attribute = _.extend(
    {name:Function, type:Function, sourceRelation:Function}, 
    like,
    inspectable
  )
  
  signatures.nestedAttribute = _.extend(
    {nestedRelation:Function}, 
    signatures.attribute
  )
  
  signatures.relation = _.extend(
    {attributes:Function, split:Function, merge:Function, newNestedAttribute:Function}, 
    like,
    inspectable
  )
  
  signatures.relationExpression = _.extend(
    {defaultCompiler:Function, compile:Function}, 
    signatures.relation
  )
  
  signatures.compiledRelation = _.extend(
    {rows:Function, objects:Function, cost:Function}, 
    signatures.relation
  )
  
  signatures.executionStrategy = _.extend(
    {rowsAsync:Function, rowsSync:Function}, 
    signatures.relation
  )
  
  signatures.join = _.extend(
    {relationOne:Object, relationTwo:Object, predicate:Object}, 
    signatures.relation
  )

  return signatures
}()
