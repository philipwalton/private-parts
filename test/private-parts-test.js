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

    it('stores a unique `__pid__` on each passed object', function() {
      var p = new PrivateParts();

      var obj1 = {};
      var obj2 = {};
      var obj3 = {};

      p.get(obj1);
      p.get(obj2);
      p.get(obj3);

      expect(obj1.__pid__).to.be.ok;
      expect(obj2.__pid__).to.be.ok;
      expect(obj3.__pid__).to.be.ok;

      expect(obj1.__pid__).to.not.equal(obj2.__pid__);
      expect(obj1.__pid__).to.not.equal(obj3.__pid__);
      expect(obj2.__pid__).to.not.equal(obj3.__pid__);

    });

    it('should store the private objects in a hash that keyed to the '
        + 'object\'s __pid__', function() {

      var p = new PrivateParts();

      var obj1 = {};
      var obj2 = {};
      var obj3 = {};

      var priv1 = p.get(obj1);
      var priv2 = p.get(obj2);
      var priv3 = p.get(obj3);

      expect(Object.keys(p.hash)).to.deep.equal([
        obj1.__pid__,
        obj2.__pid__,
        obj3.__pid__
      ]);

      expect(p.hash[obj1.__pid__]).to.equal(priv1);
      expect(p.hash[obj2.__pid__]).to.equal(priv2);
      expect(p.hash[obj3.__pid__]).to.equal(priv3);
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
    })

  });

});
