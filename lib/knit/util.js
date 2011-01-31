knit.indexOfSame = function(things, candidate) {
  var index = null
  _.detect(things, function(thisThing, i){
    if (thisThing.isSame(candidate)) {
      index = i
      return true
    } else {
      return false
    }
  })
  return index
}

//see http://javascript.crockford.com/prototypal.html
knit.createObject = function() {
  var o = arguments[0]

  function __F() {}
  __F.prototype = o
  var newObj = new __F()

  if (arguments.length==2) {
    var additions = arguments[1]
    _.extend(newObj, additions)
  }

  return newObj
}
