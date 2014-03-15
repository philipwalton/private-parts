var _ = require('../../').createKey();

function Klass() {

  // This is a public property. It will be accessible to
  // anyone who has access to the instance.
  this.pub = 'I am public.';

  // This is a private property. It's not accessible outside
  // of this scope of the `_` variable required above
  _(this).priv = 'I am private.';
}

Klass.prototype.getPriv = function() {
  return _(this).priv;
};

Klass.prototype.setPriv = function(value) {
  _(this).priv = value;
};

module.exports = Klass;
