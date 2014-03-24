var test = require('tape');
var createKey = require('..').createKey;

test('It encloses an instance of PrivateParts#get', function(t) {

  t.plan(1);

  var _1 = createKey();
  var _2 = createKey();
  var obj = {};

  // make sure each invocation of `createKey()`
  // creates a unique PrivateParts instance
  t.notEqual(_1(obj), _2(obj));
});

test('It does not leak private variables outside of a scope', function(t) {

  t.plan(3);

  var obj = {};

  (function() {
    // inner scope 1
    var _ = createKey();

    _(obj).foo = 'foo';
    _(obj).bar = 'bar';

    t.deepEqual(_(obj), { foo: 'foo', bar: 'bar' });
  }());

  (function() {
    // inner scope 2
    var _ = createKey();

    _(obj).fizz = 'fizz';
    _(obj).buzz = 'buzz';

    t.deepEqual(_(obj), { fizz: 'fizz', buzz: 'buzz' });
  }());

  // outer scope
  var _ = createKey();
  t.deepEqual(_(obj), {});
});
