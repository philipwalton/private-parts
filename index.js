var PrivateParts = require('./lib/private-parts');

module.exports = {
  createKey: function() {
    var privates = new PrivateParts();
    return function createKey(instance) {
      return privates.get(instance);
    };
  }
};
