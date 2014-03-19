var test = require('tape');
var PrivatePart = require('../lib/private-part');

test('PrivatePart#constructor'
  + ' accepts an optional object to be set as the'
  + ' prototype for all private instances.', function(t) {

  t.plan(1);

  var proto = {};
  var p = new PrivatePart(proto);

  var publicInstance = {};
  var privateInstance = p.getPrivateInstance(publicInstance);

  t.equal(Object.getPrototypeOf(privateInstance), proto);
});

test('PrivatePart#get'
  + ' accepts an object and returns its private counterpart.', function (t) {

  t.plan(4);

  var p = new PrivatePart();
  var obj1 = {};
  var obj2 = {};

  p.getPrivateInstance(obj1).foo = 'bar';
  p.getPrivateInstance(obj1).fizz = 'buzz';

  p.getPrivateInstance(obj2).foo = 'BAR';
  p.getPrivateInstance(obj2).fizz = 'BUZZ';

  // No private variables should be stored on the instance,
  // they should only be stored on the private counterpart.
  t.deepEqual(obj1, {});
  t.deepEqual(obj2, {});

  t.deepEqual(p.getPrivateInstance(obj1), { foo: 'bar', fizz: 'buzz' });
  t.deepEqual(p.getPrivateInstance(obj2), { foo: 'BAR', fizz: 'BUZZ' });

});

test('PrivatePart#get'
  + ' returns a private object whos prototype is either `this.proto`'
  + ' or (if that\'s not set) the passed object.', function (t) {

  t.plan(2);

  var privateProto = {};
  var p1 = new PrivatePart(privateProto);
  var obj1 = {};
  var priv1 = p1.getPrivateInstance(obj1);

  t.ok(privateProto.isPrototypeOf(priv1));

  var p2 = new PrivatePart();
  var obj2 = {};
  var priv2 = p2.getPrivateInstance(obj2);

  t.ok(obj2.isPrototypeOf(priv2));
});

test('PrivatePart#get'
  + ' can handle an object that has already been processed by another'
  + ' PrivatePart instance.', function(t) {

  t.plan(2);

  var p1 = new PrivatePart();
  var p2 = new PrivatePart();
  var obj = {};

  p1.getPrivateInstance(obj).name = 'foo';
  p2.getPrivateInstance(obj).name = 'bar';

  t.deepEqual(p1.getPrivateInstance(obj), { name: 'foo' });
  t.deepEqual(p2.getPrivateInstance(obj), { name: 'bar' });

});

test('PrivatePart#get'
  + ' will not double wrap a private instance. If given an existing'
  + ' private instance it will simply return it.', function(t) {

  t.plan(1);

  var p = new PrivatePart();
  var obj = {};
  var privateObj = p.getPrivateInstance(obj);

  t.equal(p.getPrivateInstance(p.getPrivateInstance(obj)), privateObj);
});
