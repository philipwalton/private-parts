var test = require('tape');
var createStore = require('../lib/private-store');

test('It accepts an object and returns an object.', function(t) {
  t.plan(1);

  var _ = createStore();
  t.ok(_({}));
});

test('It returns undefined if given a non-object.', function(t) {
  t.plan(1);

  var _ = createStore();
  t.notOk(_());
});

test('It always returns the same object given the same key.', function(t) {
  t.plan(1);

  var _ = createStore();
  var key = {};

  t.equal(_(key), _(key));
});

test('It will not double privatize an object.', function(t) {
  t.plan(1);

  var _ = createStore();
  var key = {};

  t.equal(_(_(key)), _(key));
});

test('If a factory method is passed,'
  + ' it will use it to create the private object.', function(t) {

  t.plan(1);

  var factory = function(key) {
    return { key: key };
  };

  var key = {};
  var _ = createStore(factory);

  t.deepEqual(_(key), { key: key });
});

test('If factory is an object, it will create new objects'
  + ' with factory as their prototype.', function(t) {

  t.plan(1);

  var obj = {};
  var _ = createStore(obj);

  t.equal(Object.getPrototypeOf(_({})), obj);
});


test('If no factory method is passed, it will default '
  + ' to creating an object with a null prototype.', function(t) {

  t.plan(1);

  var _ = createStore();

  t.equal(Object.getPrototypeOf(_({})), null);
});

test('Given the same key, two different stores'
  + ' will return two different objects.', function(t) {

  t.plan(1);

  var _1 = createStore();
  var _2 = createStore();
  var key = {};

  t.notEqual(_1(key), _2(key));
});
