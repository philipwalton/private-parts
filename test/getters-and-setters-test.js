var expect = require('chai').expect;
var MyObj = require('./class-fixture');
var _ = require('..').scope();

describe('Getter and Setters', function() {

  it('works like you would expect in many other languages', function() {

    var obj = new MyObj();

    // Public properties can be seen as normal.
    expect(obj.pub).to.equal('I am public.');

    // Private properties are not accessible.
    expect(obj.priv).to.be.undefined;

    // The getters and setters work just you'd expect
    expect(obj.getPriv()).to.equal('I am private.');

    obj.setPriv('I have been set!');
    expect(obj.getPriv()).to.equal('I have been set!');

    // After using the getters and setters, the
    // private property still can't be seen
    expect(obj.priv).to.be.undefined;

  });

});
