//see http://fitzgeraldnick.com/weblog/39/

knit.quacksLike = function(object, signature) {
  if (typeof signature === "undefined") throw("no signature provided")
  if (object == undefined) return false
  
  var k, ctor;
  for ( k in signature ) {
    ctor = signature[k];
    if ( ctor === Number ) {
      if ( Object.prototype.toString.call(object[k]) !== "[object Number]"
           || isNaN(object[k]) ) {
        return false;
      }
    } else if ( ctor === String ) {
      if ( Object.prototype.toString.call(object[k])
           !== "[object String]" ) {
        return false;
      }
    } else if ( ctor === Boolean ) {
      var value = object[k]
      if (!(value === true || value === false)) return false
    } else if ( ! (object[k] instanceof ctor) ) {
      return false;
    }
  }
  return true;
};