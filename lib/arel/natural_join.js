require("arel/core")

arel.NaturalJoin = function(relationOne, relationTwo){
  var combinedName = relationOne.name() + "__" + relationTwo.name()
  var combinedAttributes = relationOne.attributes().concat(relationTwo.attributes())
  
  this.name = function(){return combinedName}
  this.attributes = function(){return combinedAttributes}





// Natural join: If the two relations being joined have exactly one attribute (domain) name in common, then we assume that the single attribute in common is the one being compared to see if a new tuple will be inserted in the result.

  
  //how do i determine if something is a natural join?
  //imagine the select has other stuff intermingled in
  //or the project...
  
  //GOAL:  express this using a Join prototype,
  //where you express the restriction efficiently...
  //
  //or is that an exercise left to the implementation?
  //
  //should the algebra code be in the business of computing the attributes?
  //or leaving that to the engine...?
  //
  //in the case of sql aren't we just saying "NATURAL JOIN" and letting the 
  //output tell us what attrs are emitted?
  //
  //...but we need to be able to predict the attr combination to continue
  //using the relation in a statement...
  
  
  
  //attribute: matching
  //set: symmetricDifference
    //this is a mixin
  //predicate: arel.And, arel.Equal
  //join: cartesian join
    //maybe the in-memory engine just needs to define a cartesian join...
  //relation set operations: select, project
  
  //relation has general set capability also
    //symmetric difference = anti join, for example.
  
  // _.extend(this, 
  //     relationOne.
  //       join(relationTwo).
  //       select( 
  //         arel.And(
  //           _(relationOne.attributes().matching(relationTwo.attributes())).map(function(pair){
  //             return pair.first.eq(pair.last)
  //           })
  //         )
  //       ).
  //       project(relationOne.attributes().symmetricDifference(relationOne.attributes()))
  //   )
  
  //...would be awesome to use math to arrive at a more efficient join
  //...maybe I should be able to do this.
  //Maybe this is a requirement...acceptance criteria for a real relational model.
  
  //tupleCountSync()
  //tuples - its own class?
  //tuples().countSync()
  //tuples().count(func)
  //tuples().fetchSync()
  //tuples().fetch(func)
    //like jquery selectors or sequel - review each.
  
  //implement selection,projection pushing and splitting
    //you should be able to selection push your way to a hash join strategy...right?
    //should be able to calculate a cost of the operation, test-drive/acceptance test using cost
      // when combined with an engine (in-memory...count tuples in a relation).
}