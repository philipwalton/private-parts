var test = require('tape');
var PrivatePart = require('../lib/private-part');

test('PrivatePart#get'
  + ' accepts an object and returns its private counterpart.', function (t) {

  t.plan(4);

  var p = new PrivatePart();
  var obj1 = {};
  var obj2 = {};

  p.get(obj1).foo = 'bar';
  p.get(obj1).fizz = 'buzz';

  p.get(obj2).foo = 'BAR';
  p.get(obj2).fizz = 'BUZZ';

  // No private variables should be stored on the instance,
  // they should only be stored on the private counterpart.
  t.deepEqual(obj1, {});
  t.deepEqual(obj2, {});

  t.deepEqual(p.get(obj1), { foo: 'bar', fizz: 'buzz' });
  t.deepEqual(p.get(obj2), { foo: 'BAR', fizz: 'BUZZ' });

});

test('PrivatePart#get'
  + ' returns a private object whos prototype is either'
  + ' `this.proto` or (of not set) the passed object.', function (t) {

  t.plan(2);

  var privateProto = {};
  var p1 = new PrivatePart(privateProto);
  var obj1 = {};
  var priv1 = p1.get(obj1);

  t.ok(privateProto.isPrototypeOf(priv1));

  var p2 = new PrivatePart();
  var obj2 = {};
  var priv2 = p2.get(obj2);

  t.ok(obj2.isPrototypeOf(priv2));
});

test('PrivatePart#get'
  + ' can handle an object that has already been processed by another'
  + ' PrivatePart instance.', function(t) {

  t.plan(2);

  var p1 = new PrivatePart();
  var p2 = new PrivatePart();
  var obj = {};

  p1.get(obj).name = 'foo';
  p2.get(obj).name = 'bar';

  t.deepEqual(p1.get(obj), { name: 'foo' });
  t.deepEqual(p2.get(obj), { name: 'bar' });

});

test('PrivatePart#get'
  + ' will not double wrap a private instance. If given an existing'
  + ' private instance it will simply return it.', function(t) {

  t.plan(2);

  var p = new PrivatePart();
  var obj = {};
  var privateObj = p.get(obj);

  t.equal(p.get(p.get(obj)), privateObj);
  t.equal(p.get(p.get(p.get(obj))), privateObj);
});
