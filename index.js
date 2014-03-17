var PrivatePart = require('./lib/private-part');

module.exports = {
  createKey: function(privateMethods) {
    var privates = new PrivatePart(privateMethods);
    return function createKey(instance) {
      return privates.get(instance);
    };
  }
};
