Relational algebra for javascript.

## Abstract
  
Expressions of relational algebra in pure form are rare in the programming world.  It's a shame - the relational paradigm is a powerful and efficient way of organizing and manipulating data in general, not just within RDBs.
  
Knit follows projects like Arel* and LINQ as an attempt to bring the power of relational algebra to programmers.
    
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


    

## Footnotes

*that is, Arel as originally envisioned.  Arel 1.0 had echoes of relational algebra (the terminology, implementations of the major RA operations).  More importantly for Rails, it enabled a powerful composable style, and perhaps because of its success within the Rails project Rails developers reworked it as a focused SQL-oriented tool.
  
As of version 2.0 Arel is really a SQL AST, as Aaron Patterson indicates:
  
<blockquote>
  Though ARel is billed as a “relational algebra” library, the current implementation is entirely built using patterns found in compiler technology. I think a more accurate description of ARel would be “an SQL compiler.
</blockquote>

[Architecture of ARel 2.0](http://engineering.attinteractive.com/2010/12/architecture-of-arel-2-0/)