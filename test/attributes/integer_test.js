require(__dirname + "/../test_helper.js");
require(__dirname + "/../../lib/arel/attributes/integer")

regarding(arel.Attributes.Integer, function () {

  regarding("type casting", function () {

    test('casting an int to an int just yields the original value', function () {
      assert.equal(56, new arel.Attributes.String().typeCast(56));
    });

  });

});

