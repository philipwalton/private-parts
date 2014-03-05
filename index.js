// TODO consider adding a WeakMap shim:
// https://github.com/Benvie/WeakMap/blob/master/weakmap.js

var PrivateParts = require('./lib/private-parts');

module.exports = {
  createKey: function() {
    var privates = new PrivateParts();
    return function createKey(instance) {
      return privates.get(instance);
    };
  }
};
