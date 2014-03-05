var expect = require('chai').expect;
var PrivateParts = require('../lib/private-parts');

describe('PrivateParts', function() {

  describe('#get', function() {

    it('accepts an object and returns its private counterpart', function() {
      var p = new PrivateParts();

      var obj1 = {};
      var obj2 = {};

      p.get(obj1).foo = 'bar';
      p.get(obj1).fizz = 'buzz';

      p.get(obj2).foo = 'BAR';
      p.get(obj2).fizz = 'BUZZ';

      // no private variables should be stored on the instance
      expect(obj1).to.deep.equal({});
      expect(obj2).to.deep.equal({});

      expect(p.get(obj1)).to.deep.equal({
        foo: 'bar',
        fizz: 'buzz'
      });

      expect(p.get(obj2)).to.deep.equal({
        foo: 'BAR',
        fizz: 'BUZZ'
      });

    });

    it('returns a private object with the passed object as its prototype '
        + 'so it can access both private and public properties', function() {

      var p = new PrivateParts();

      var obj = {};
      var priv = p.get(obj);

      expect(obj.isPrototypeOf(priv)).to.be.ok;
    });

    it('can handle an object that has already been processed by another '
        + 'PrivateParts instance', function() {

      var p1 = new PrivateParts();
      var p2 = new PrivateParts();
      var obj = {};

      p1.get(obj).name = 'foo';
      p2.get(obj).name = 'bar';

      expect(p1.get(obj).name).to.equal('foo');
      expect(p2.get(obj).name).to.equal('bar');
    });

  });

});
