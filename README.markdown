Relational algebra for javascript.

## Abstract
  
Expressions of relational algebra in pure form are rare in the programming world.  It's a shame - the relational paradigm is a powerful and efficient way of organizing and manipulating data in general, not just within RDBs.
  
Knit follows projects like Arel* and LINQ as an attempt to bring the power of relational algebra to programmers.

Knit is alpha quality and the api changes regularly.
    
## Examples

To start us off...

    //aside: http://aresemicolonsnecessaryinjavascript.com
    
    require("knit/engine/memory")
    
    var $R = knit({
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
    
    $R(function(){
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


    

## Status, Directions

Knit works.  It's an exciting initial attempt at working out a multi-engine RA library.

But it's far from finished, and there are so many interesting avenues to explore.  Here's just a sampling of todos / possible directions:

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
- Move from a array-of-rows orientation to a stream / iterator style
- Evaluate async style - would it make sense?  (there are challenges - think of how join might be implemented give that the constituent relations are returning rows asynchronously)
...etc...
  

## Footnotes

*that is, Arel as originally envisioned.  Arel 1.0 had echoes of relational algebra (the terminology, implementations of the major RA operations).  More importantly for Rails, it enabled a powerful composable style, and perhaps because of its success within the Rails project Rails developers reworked it as a focused SQL-oriented tool.
  
As of version 2.0 Arel is really a SQL AST, as [Aaron Patterson indicates](http://engineering.attinteractive.com/2010/12/architecture-of-arel-2-0/):
  
<blockquote>
  Though ARel is billed as a “relational algebra” library, the current implementation is entirely built using patterns found in compiler technology. I think a more accurate description of ARel would be “an SQL compiler.
</blockquote>