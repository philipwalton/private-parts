var PrivateParts = require('./lib/private-parts');

module.exports = {
  scope: function() {
    var privates = new PrivateParts();
    return function(instance) {
      return privates.get(instance);
    }
  }
};
