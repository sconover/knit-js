require("knit/core")
require("knit/algebra/divide")

knit.algebra.Divide = function(){

  var C = function(dividend, divisor) {
            this.dividend = dividend
            this.divisor = divisor
            //predicate?
          },
      p = C.prototype
  
  knit.mixin.relationDefaults(p)
  
  p.newNestedAttribute = function() {    
    return this.dividend.newNestedAttribute.apply(this.dividend, arguments)
  }
  
  p.attributes = function(){ return this.dividend.attributes().differ(this.divisor.attributes()) }
  
  p.defaultCompiler = function() { return this.dividend.defaultCompiler() }

  p.isSame = 
    p.isEquivalent = function(other) {
      return other.constructor == C && 
             this.dividend.isSame(other.dividend) &&
             this.dividend.isSame(other.divisor)
    }
   // 
   // p.isEquivalent = function(other) {
   //   return this.isSame(other) ||
   //            other.constructor == C && 
   // 
   //            ((this.dividendOne.isSame(other.relationOne) &&
   //             this.dividendTwo.isSame(other.relationTwo)) ||
   // 
   //            (this.dividendOne.isSame(other.relationTwo) &&
   //             this.dividendTwo.isSame(other.relationOne))) &&
   // 
   //            this.predicate.isEquivalent(other.predicate)
   // }
  
  p.inspect = function(){
    return "divide(" + this.dividend.inspect() + "," + this.divisor.inspect() + ")"
  }

  return C
}()

knit.createBuilderFunction.dslLocals.divide = function(dividend, divisor) { 
  return new knit.algebra.Divide(dividend, divisor) 
}