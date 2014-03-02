var _ = require('..').scope();

function MyObj() {

  // This is a public property. It will be access to
  // anyone who has access to the instance.
  this.pub = 'I am public.';

  // This is a private property. It's not accessible outside
  // of this scope of the `_` variable required above
  _(this).priv = 'I am private.';
}

MyObj.prototype.getPriv = function() {
  return _(this).priv;
};

MyObj.prototype.setPriv = function(value) {
  _(this).priv = value;
};

module.exports = MyObj;
