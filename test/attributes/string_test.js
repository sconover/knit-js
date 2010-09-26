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

  });

});

