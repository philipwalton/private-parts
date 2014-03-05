var expect = require('chai').expect;
var createKey = require('../').createKey;

describe('scope', function() {

  it('encloses an instance of PrivateParts#get', function() {
    var _1 = createKey();
    var _2 = createKey();
    var obj = {};

    // make sure each invocation of `createKey()`
    // creates a unique PrivateParts instance
    expect(_1(obj)).to.not.equal(_2(obj));
  });

  it('does not leak private variables outside of a scope', function() {

    var obj = {};

    (function() {

      // inner scope 1
      var _ = createKey();

      _(obj).foo = 'foo';
      _(obj).bar = 'bar';

      expect(_(obj)).to.deep.equal({ foo: 'foo', bar: 'bar' });

    }());

    (function() {

      // inner scope 2
      var _ = createKey();

      _(obj).fizz = 'fizz';
      _(obj).buzz = 'buzz';

      expect(_(obj)).to.deep.equal({ fizz: 'fizz', buzz: 'buzz' });

    }());

    // outer scope
    var _ = createKey();
    expect(_(obj)).to.deep.equal({});

  });

});
