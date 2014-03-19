var PrivatePart = require('./lib/private-part');

module.exports = {
  createKey: function(privateMethods) {
    var privatePart = new PrivatePart(privateMethods);
    return function createKey(instance) {
      return privatePart.getPrivateInstance(instance);
    };
  }
};
