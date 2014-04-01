var test = require('tape');
var createKey = require('..').createKey;

test('It accepts an object and returns an object.', function(t) {
  t.plan(1);

  var _ = createKey();
  t.ok(_({}));
});

test('It returns undefined if given a non-object.', function(t) {
  t.plan(1);

  var _ = createKey();
  t.notOk(_());
});

test('It always returns the same private object'
  + ' given the same public object.', function(t) {

  t.plan(1);

  var _ = createKey();
  var pub = {};

  t.equal(_(pub), _(pub));
});

test('It will not double privatize an object.', function(t) {
  t.plan(1);

  var _ = createKey();
  var pub = {};

  t.equal(_(_(pub)), _(pub));
});

test('If a factory method is passed,'
  + ' it will use it to create the private object.', function(t) {

  t.plan(1);

  var factory = function(obj) {
    return { contains: obj };
  };

  var pub = {};
  var _ = createKey(factory);

  t.deepEqual(_(pub), { contains: pub });
});

test('If factory is an object, it will create new objects'
  + ' with factory as their prototype.', function(t) {

  t.plan(1);

  var obj = {};
  var _ = createKey(obj);

  t.equal(Object.getPrototypeOf(_({})), obj);
});


test('If no factory method is passed, it will default '
  + ' to creating a plain old JavaScript object.', function(t) {

  t.plan(2);

  var _ = createKey();

  t.deepEqual(_({}), {});
  t.equal(Object.getPrototypeOf(_({})), Object.prototype);
});

test('Given the same public object, two different stores'
  + ' will return two different private objects.', function(t) {

  t.plan(1);

  var _1 = createKey();
  var _2 = createKey();
  var pub = {};

  t.notEqual(_1(pub), _2(pub));
});

test('It does not leak values outside of a scope', function(t) {

  t.plan(3);

  var pub = {};

  (function() {
    // inner scope 1
    var _ = createKey();

    _(pub).foo = 'foo';
    _(pub).bar = 'bar';

    t.deepEqual(_(pub), { foo: 'foo', bar: 'bar' });
  }());

  (function() {
    // inner scope 2
    var _ = createKey();

    _(pub).fizz = 'fizz';
    _(pub).buzz = 'buzz';

    t.deepEqual(_(pub), { fizz: 'fizz', buzz: 'buzz' });
  }());

  // outer scope
  var _ = createKey();
  t.deepEqual(_(pub), {});
});
