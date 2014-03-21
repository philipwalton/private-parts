var PrivatePart = require('./lib/private-part');

module.exports = {
  /**
   * A factory function that creates a new PrivatePart instance, and returns
   * a function that calls the instances `getPrivateInstance` method.
   */
  createKey: function(proto) {
    var privatePart = new PrivatePart(proto);
    return function createKey(instance) {
      return privatePart.getPrivateInstance(instance);
    };
  }
};
