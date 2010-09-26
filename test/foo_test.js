require(__dirname + "/test_helper.js");

regarding('foo', function () {
  test('this is a test', function () {
    assert.equal(1,1);
  });
});

