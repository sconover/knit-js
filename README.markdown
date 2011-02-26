![Knit - Relational algebra for javascript](http://farm1.static.flickr.com/50/108225549_fd778a4a92_m.jpg)

Relational algebra for javascript.

## Abstract

Expressions of relational algebra in pure form are rare in the programming world.  It's a shame - the relational paradigm is a powerful and efficient way of organizing and manipulating data in general, not just within RDBs.
  
Knit follows projects like Arel<a href="#arel">*</a> and LINQ as an attempt to bring the power of relational algebra to programmers.

Knit is alpha quality and the api changes regularly.
    
## Examples

Quick start:

1. Create a couple of in-memory relations.
2. Join them on cityId, and project the resulting relation down to house address and city name.

...

    //aside: http://aresemicolonsnecessaryinjavascript.com
    
    require("knit/engine/memory")
    
    var $K = knit({
      house:{attributes:["houseId", "address", "cityId"],
             rows:[
               [101, "Market", 1001],
               [102, "Parnassus", 1001],
               [103, "Canal", 1002]
             ]},
      city:{attributes:["cityId", "name"],
            rows:[
              [1001, "San Francisco"],
              [1002, "New Orleans"]
            ]} 
    })
    
    //If you're new to RA but familiar with SQL, think:
    //  select house.address, city.name
    //  from house join city on house.cityId = city.cityId
    
    $K(function(){
      return project(
               join(relation("house"), relation("city"), 
                    eq(attr("house.cityId"), attr("city.cityId"))), 
               attr("house.address", "city.name")
             )
    }).compile().rows()
       ==>  [
              ["Market",    "San Francisco"],
              ["Parnassus", "San Francisco"],
              ["Canal",     "New Orleans"]
            ]

This should provide a flavor of what's possible with pure relational algebra.
Rather than expressing relational operations as a big blob of sql:

    select house.address, city.name from house join city on house.cityId = city.cityId
    
Each operation yields a relation.

The following are all valid relations, with sql equivalents:

    relation("house") 
      //select * from house
    
    relation("city") 
      //select * from city
    
    join(relation("house"), relation("city")) 
      //(cartesian join) select * from house join city
    
    project(relation("house"), attr("house.houseId", "house.address"))
      //select house.houseId, house.address from house




    
The same example, using RDB storage.  Makes use of knit's *very alpha* sqlite support.
    require("knit/engine/sqlite")

    var conn = new knit.engine.sqlite.Connection(":memory:")
    conn.open()
    
    //create a couple of tables, with rows
    
    var house = knit.engine.sqlite.Table.create(
                  conn, 
                  "house", 
                  [["houseId", knit.attributeType.Integer], 
                   ["address", knit.attributeType.String], 
                   ["cityId",  knit.attributeType.Integer]], 
                  ["houseId"]
                ).merge([
                  [101, "Market", 1001],
                  [102, "Parnassus", 1001],
                  [103, "Canal", 1002]                
                ])
        
    var city = knit.engine.sqlite.Table.create(
                 conn, 
                 "city", 
                 [["cityId",  knit.attributeType.Integer], 
                  ["name",    knit.attributeType.String]], 
                 ["cityId"]
               ).merge([
                 [1001, "San Francisco"],
                 [1002, "New Orleans"]
               ])
    
    var $K = knit({bindings:{city:city, house:house}})
    
    
    //join and project as in the first example
    
    $K(function(){
      return project(
               join(relation("house"), relation("city"), 
                    eq(attr("house.cityId"), attr("city.cityId"))), 
               attr("house.address", "city.name")
             )
    }).compile().rows()
       ==>  [
              ["Market",    "San Francisco"],
              ["Parnassus", "San Francisco"],
              ["Canal",     "New Orleans"]
            ]

    conn.close()


## Examples, Continued: Acceptance Tests

Please see the suite of acceptance tests under test/acceptance, they are intended to be "executable documentation".  They should give you an overview of what's possible with knit.

## DSL

The DSL uses a functional programming style.  In fact it ought to read very much like this [explanation of relational algebra](http://www.cs.rochester.edu/~nelson/courses/csc_173/relations/algebra.html).

The pattern is as follows:

    operation(relation, other_parameters...)

So starting with a relation representing a bunch of houses:

    relation("house")

Select houses on Main street:

    select(
      relation("house"), 
      eq(attr("house.address"), "Main")
    )

Houses on Main street and the people in them:

    naturalJoin(
      select(
        relation("house"), 
        eq(attr("house.address"), "Main")
      ), 
      relation("person")
    )

People found in houses on Main street:

    project(
      naturalJoin(
        select(
          relation("house"), 
          eq(attr("house.address"), "Main")
        ), 
        relation("person")
      ),
      attr("person.name", "person.age")
    )

You could of course extract the relations into variables:

    var housesOnMainStreet = select(relation("house"), eq(attr("house.address"), "Main"))
     
    var peopleAndHousesOnMainStreet = naturalJoin(housesOnMainStreet, relation("person"))
    
    var peopleOnMainStreet = project(peopleAndHousesOnMainStreet, attr("person.name", "person.age"))

## Concepts, Lifecycle    

Breaking down the in-memory example above.  We started by creating a DSL function, providing it the base relation "bindings":

    var $K = knit({
      house:{attributes:["houseId", "address", "cityId"],
             rows:[
               [101, "Market", 1001],
               [102, "Parnassus", 1001],
               [103, "Canal", 1002]
             ]},
      city:{attributes:["cityId", "name"],
            rows:[
              [1001, "San Francisco"],
              [1002, "New Orleans"]
            ]} 
    })

Then we created a relational expression using knit's DSL:

    var expression = $K(function(){
      return project(
               join(relation("house"), relation("city"), 
                    eq(attr("house.cityId"), attr("city.cityId"))), 
               attr("house.address", "city.name")
             )
    })

"Expression" is an appropriate term here: the result has no "rows()" - it's an airy, abstract thing.

It needs to be bound with base relations that contain rows.  I've chosen the compilation metaphor to express this (you're "compiling the expression down" to an algorithm, or to sql):

    var rows = expression.compile().rows()

Here's what's going on when using the in-memory engine:

1. I define an expression (project(join(...)...)  etc).  
2. As the expression passes out of the DSL function, the [base relations](https://github.com/sconover/knit-js/blob/master/lib/knit/engine/memory/base_relation.js) and [attributes](https://github.com/sconover/knit-js/blob/master/lib/knit/engine/memory/attribute.js) are "linked up" in the appropriate places.  relation("house") points to the in-memory relation "house".
3. I call .compile().  The expression is [converted](https://github.com/sconover/knit-js/blob/master/lib/knit/translation/algorithm/algebra_to_algorithm.js) to its equivalent "algorithm" - implementations of relational operations that execute in-memory ([code](https://github.com/sconover/knit-js/blob/master/lib/knit/algorithms.js), [tests](https://github.com/sconover/knit-js/tree/master/test/algorithms)).  The result is an [executable relation](https://github.com/sconover/knit-js/blob/master/lib/knit/executable_relation.js).
4. I call .rows() on the executable relation.  This pulls the rows from base relations, sends them through the appropriate algorithms, and returns the end result.

And when using the sqlite engine:

1. I define an expression (project(join(...)...)  etc).  
2. As the expression passes out of the DSL function, the [tables](https://github.com/sconover/knit-js/blob/master/lib/knit/engine/sqlite/table.js) and [columns](https://github.com/sconover/knit-js/blob/master/lib/knit/engine/sqlite/column.js) are "linked up" in the appropriate places.  relation("house") points to the table "house".
3. I call .compile().  The expression is [converted](https://github.com/sconover/knit-js/blob/master/lib/knit/translation/sql/algebra_to_sql.js) to its equivalent [sql object](https://github.com/sconover/knit-js/blob/master/lib/knit/translation/sql/base.js).  The result is an [executable relation](https://github.com/sconover/knit-js/blob/master/lib/knit/executable_relation.js), as before.
4. I call .rows() on the executable relation.  The [sql query execution strategy](https://github.com/sconover/knit-js/blob/master/lib/knit/engine/sqlite/query.js) converts the sql object [into a sql statement](https://github.com/sconover/knit-js/blob/master/lib/knit/translation/sql/to_statement.js), executes this against the database, and returns the result.


## Status, Direction

Knit works.  It's an exciting initial attempt at working out a multi-engine RA library.

But it's far from finished, and there are many interesting avenues to explore.  Here's just a sampling of todos / possible directions:

- Beef up the sql/sqlite implementation.  
  - SQL transformation capability is naive
  - A second database (e.g. MySQL) would force out dialects
  - Knit ought to be usable with browser sqlite implementations 
- More RA operations
  - Aggregate ("group by"), equi and anti joins, and on and on...
  - Exotic operations like "pivot"
  - Fill out the predicates (or, grouping, gt, gte, etc)
- RA expressions to/from JSON
  - ...which would allow us to express the acceptance tests in a manner that crosses languages
  - Now RA expressions can be shipped across the wire, stored, etc.  Neat!
- Cross-engine capability
- Efficiency.  Many O(N) enhancements are possible.
- Error reporting.  Knit could use better guardrails.
- Move from a array-of-rows orientation to a stream / iterator style
- Evaluate async style - would it make sense?  (there are challenges - think of how join might be implemented give that the constituent relations are returning rows asynchronously)
- ...etc...

## Running the Tests

Sorry this is a little cumbersome, it's a todo to clean this up (presumably use npm).

### "Main" suite (everything but sqlite, should work with any modern node install)

1. Install [Node.js](https://github.com/joyent/node/wiki/Installation)
2. Clone knit-js
3. In a sibling directory, clone sconover's jasmine-node:
    git clone https://github.com/sconover/jasmine-node.git
4. cd to knit-js.  run 
    node test/main_suite.js


### Sqlite suite (everything but sqlite) - requires node 0.2.x for now

Regarding the node v0.2.6 requirement - the combination of a pretty rough world when it comes to node/sqlite support and my own requirements (namely, that the sqlite driver supports sync operation) means I need to use grumdig's node-sqlite, which segfaults on node > 0.2.6.  Improving this state of affairs is a priority.

1. Install [Node.js](https://github.com/joyent/node/wiki/Installation) - IMPORTANT - must be v0.2.x!
2. Clone knit-js
3. In a sibling directory, clone sconover's jasmine-node:
    git clone https://github.com/sconover/jasmine-node.git
4. In a sibling directory, clone grumdrig's node-sqlite:
    git clone https://github.com/grumdrig/node-sqlite.git
5. Build node-sqlite - see the [node-sqlite installation instructions](http://grumdrig.com/node-sqlite/).
6. cd to knit-js.  run 
    node test/suite.js
 
## Relational Algebra Resources

[Wikipedia: Relational Algebra](http://en.wikipedia.org/wiki/Relational_algebra)

[University of Rochester, CSC173, Relational Algebra Intro](http://www.cs.rochester.edu/~nelson/courses/csc_173/relations/algebra.html)



## Footnotes

<a name="arel">
*that is, Arel as originally envisioned.  [Arel 1.0](https://github.com/nkallen/arel) had echoes of relational algebra (the terminology, implementations of the major RA operations).  More importantly for Rails, it enabled a powerful composable style, and perhaps because of its success within the Rails project Rails developers reworked it as a focused SQL-oriented tool.
  
As of [version 2.0](https://github.com/rails/arel) Arel is really a SQL AST library, as [Aaron Patterson indicates](http://engineering.attinteractive.com/2010/12/architecture-of-arel-2-0/):
  
<blockquote>
  Though ARel is billed as a “relational algebra” library, the current implementation is entirely built using patterns found in compiler technology. I think a more accurate description of ARel would be “a SQL compiler".
</blockquote>