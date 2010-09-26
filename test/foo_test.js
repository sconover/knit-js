require(__dirname + "/test_helper.js");

regarding('foo', function () {
  test('this is a test', function () {
    expect(1).toEqual(1);
  });
});
