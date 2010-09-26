require(__dirname + "/../test_helper.js");
require(__dirname + "/../../lib/arel/attributes/string")

regarding(arel.Attributes.String, function () {

  regarding("type casting", function () {

    test('casting a string to string just yields the original value', function () {
      assert.equal("foo", new arel.Attributes.String().typeCast("foo"));
    });

    test('casting null is just yields null', function () {
      assert.equal(null, new arel.Attributes.String().typeCast(null));
    });

    test('casting an integer yields the string equivalent', function () {
      assert.equal("56", new arel.Attributes.String().typeCast(56));
    });

    test('any object with toString defined can be cast', function () {
      var Widget = function(){};
      Widget.prototype.toString = function(){return "zzz";};
      assert.equal("zzz", new arel.Attributes.String().typeCast(new Widget()));
    });

  });

});

