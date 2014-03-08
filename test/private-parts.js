var test = require('tape');
var PrivateParts = require('../lib/private-parts');

test('PrivateParts#get'
  + ' accepts an object and returns its private counterpart', function (t) {

  t.plan(4);

  var p = new PrivateParts();
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

test('PrivateParts#get'
  + ' returns a private object with the passed object as its prototype'
  + ' so it can access both private and public properties', function (t) {

  t.plan(1);

  var p = new PrivateParts();

  var obj = {};
  var priv = p.get(obj);

  t.ok(obj.isPrototypeOf(priv));

});

test('PrivateParts#get'
  + ' can handle an object that has already been processed by another'
  + ' PrivateParts instance', function(t) {

  t.plan(2);

  var p1 = new PrivateParts();
  var p2 = new PrivateParts();
  var obj = {};

  p1.get(obj).name = 'foo';
  p2.get(obj).name = 'bar';

  t.deepEqual(p1.get(obj), { name: 'foo' });
  t.deepEqual(p2.get(obj), { name: 'bar' });

});


