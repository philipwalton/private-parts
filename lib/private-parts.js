var uid = 0;

function PrivateParts() {
  this.hash = Object.create(null);
}

PrivateParts.prototype.get = function(obj) {
  if (!obj.__pid__) {
    Object.defineProperty(obj, '__pid__', {
      value: 'p' + uid++,
      configurable: true // This allows the property to be deleted.
    });
  }
  return obj.__pid__ in this.hash
    ? this.hash[obj.__pid__]
    : (this.hash[obj.__pid__] = Object.create(obj));
};

PrivateParts.prototype.destroy = function(obj) {
  delete this.hash[obj.__pid__];
  delete obj.__pid__;
};

module.exports = PrivateParts;
