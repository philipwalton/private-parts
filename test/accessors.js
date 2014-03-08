var test = require('tape');
var Klass = require('./fixtures/klass');

test('accessor methods', function(t) {

  t.plan(5);

  var obj = new Klass();

  // Public properties can be seen as normal.
  t.equals(obj.pub, 'I am public.');

  // Private properties are not accessible.
  t.notOk(obj.priv);

  // The getters and setters work just you'd expect
  t.equals(obj.getPriv(), 'I am private.');

  obj.setPriv('I have been set!');
  t.equals(obj.getPriv(), 'I have been set!');

  // After using the getters and setters, the
  // private property still can't be seen
  t.notOk(obj.priv);

});
