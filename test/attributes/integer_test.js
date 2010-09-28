require("../test_helper.js");
require("arel/attributes/integer")

regarding("arel.Attributes.Integer", function () {

  regarding("type casting", function () {

    test('casting an int to an int just yields the original value', function () {
      assert.equal(56, new arel.Attributes.Integer().typeCast(56));
    });

    test('null/undef returns null/undef', function () {
      assert.equal(null, new arel.Attributes.Integer().typeCast(null));
      assert.equal(undefined, new arel.Attributes.Integer().typeCast(undefined));
    });
    
    test('empty string becomes null', function () {
      assert.equal(null, new arel.Attributes.Integer().typeCast(""));
    });
    
    test('string (integer) to integer conversions', function () {
      assert.equal(0, new arel.Attributes.Integer().typeCast("0"));
      assert.equal(24, new arel.Attributes.Integer().typeCast("24"));
      assert.equal(24, new arel.Attributes.Integer().typeCast("  24"));
      assert.equal(24, new arel.Attributes.Integer().typeCast("24  "));
      assert.equal(-24, new arel.Attributes.Integer().typeCast("-24"));
      assert.equal(-24, new arel.Attributes.Integer().typeCast("  -24"));
      assert.equal(-24, new arel.Attributes.Integer().typeCast("-24   "));
    });

    test('string (float) to integer conversions', function () {
      assert.equal(0, new arel.Attributes.Integer().typeCast("0.0"));
      assert.equal(0, new arel.Attributes.Integer().typeCast(".0"));
      assert.equal(0, new arel.Attributes.Integer().typeCast(" .0"));
      assert.equal(0, new arel.Attributes.Integer().typeCast(".41"));
      
      assert.equal(24, new arel.Attributes.Integer().typeCast("24.35"));
      assert.equal(24, new arel.Attributes.Integer().typeCast(" 24.35"));
      assert.equal(24, new arel.Attributes.Integer().typeCast("24.35 "));
      assert.equal(-24, new arel.Attributes.Integer().typeCast("-24.35"));
      assert.equal(-24, new arel.Attributes.Integer().typeCast(" -24.35"));
      assert.equal(-24, new arel.Attributes.Integer().typeCast("-24.35 "));
    });

  });

});

