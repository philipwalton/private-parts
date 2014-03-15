var PrivatePart = require('./lib/private-part');

module.exports = {
  createKey: function() {
    var privates = new PrivatePart();
    return function createKey(instance) {
      return privates.get(instance);
    };
  }
};
