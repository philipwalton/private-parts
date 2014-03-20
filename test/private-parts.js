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
  + ' or (if that\'s not set) the passed object\'s prototype.', function (t) {

  t.plan(2);

  var privateProto = {};
  var p1 = new PrivatePart(privateProto);
  var publicInstance1 = {};
  var privateInstance1 = p1.getPrivateInstance(publicInstance1);

  t.equal(Object.getPrototypeOf(privateInstance1), privateProto);

  var publicProto = {};
  var p2 = new PrivatePart();
  var publicInstance2 = Object.create(publicProto);
  var privateInstance2 = p2.getPrivateInstance(publicInstance2);

  t.equal(Object.getPrototypeOf(privateInstance2), publicProto);
});

test('PrivatePart#get'
  + ' can handle an object that has already been processed by another'
  + ' PrivatePart instance.', function(t) {

  t.plan(2);

  var p1 = new PrivatePart();
  var p2 = new PrivatePart();
  var publicInstance = {};

  p1.getPrivateInstance(publicInstance).name = 'foo';
  p2.getPrivateInstance(publicInstance).name = 'bar';

  t.deepEqual(p1.getPrivateInstance(publicInstance), { name: 'foo' });
  t.deepEqual(p2.getPrivateInstance(publicInstance), { name: 'bar' });

});

test('PrivatePart#get'
  + ' will not double wrap a private instance. If given an existing'
  + ' private instance it will simply return it.', function(t) {

  t.plan(1);

  var p = new PrivatePart();
  var publicInstance = {};
  var privateObj = p.getPrivateInstance(publicInstance);

  t.equal(
    p.getPrivateInstance(p.getPrivateInstance(publicInstance)),
    privateObj
  );
});
