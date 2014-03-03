var PrivateParts = require('./lib/private-parts');

module.exports = {
  scope: function() {
    var privates = new PrivateParts();
    return function key(instance, destroy) {
      return destroy === 'destroy'
        ? privates.destroy(instance)
        : privates.get(instance);
    };
  }
};
