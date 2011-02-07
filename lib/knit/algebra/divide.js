require("knit/core")
require("knit/algebra/divide")

knit.algebra.Divide = function(){

  var F = function(dividend, divisor) {
    this.dividend = dividend
    this.divisor = divisor
    //predicate?
  }; var p = F.prototype
  
  knit.mixin.RowsAndObjects(p)
  
  p.newNestedAttribute = function() {    
    return this.dividend.newNestedAttribute.apply(this.dividend, arguments)
  }
  
  p.attributes = function(){ return this.dividend.attributes().differ(this.divisor.attributes()) }
  
  p.perform = function() {
    //force order for now, to simplify things...
    var quotientAttributes = this.dividend.attributes().differ(this.divisor.attributes())
    var dividendAttributesWithDivisorAttributesFirst = this.divisor.attributes().concat(quotientAttributes)
    var orderedDividend = dividendAttributesWithDivisorAttributesFirst.decorateOrderOn(this.dividend, knit.algebra.Order.ASC)
    var orderedDivisor = this.divisor.attributes().decorateOrderOn(this.divisor, knit.algebra.Order.ASC)
    return orderedDividend.perform().performDivide(orderedDivisor.perform(), quotientAttributes)
  }

  p.isSame = p.isEquivalent = function(other) {
    return other.constructor == F && 
           this.dividend.isSame(other.dividend) &&
           this.dividend.isSame(other.divisor)
  }
   // 
   // p.isEquivalent = function(other) {
   //   return this.isSame(other) ||
   //            other.constructor == F && 
   // 
   //            ((this.dividendOne.isSame(other.relationOne) &&
   //             this.dividendTwo.isSame(other.relationTwo)) ||
   // 
   //            (this.dividendOne.isSame(other.relationTwo) &&
   //             this.dividendTwo.isSame(other.relationOne))) &&
   // 
   //            this.predicate.isEquivalent(other.predicate)
   // }
  
  p.split = p.merge = function(){return this}
  
  p.inspect = function(){
    return "divide(" + this.dividend.inspect() + "," + this.divisor.inspect() + ")"
  }

  return F
}()

knit.createBuilderFunction.dslLocals.divide = function(dividend, divisor) { 
  return new knit.algebra.Divide(dividend, divisor) 
}