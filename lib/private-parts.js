var uid = 0;

function PrivateParts() {
  this.hash = Object.create(null);
}

PrivateParts.prototype.get = function(obj) {
  if (!obj.__pid__) {
    Object.defineProperty(obj, '__pid__', { value: 'p' + uid++ });
  }
  return obj.__pid__ in this.hash
    ? this.hash[obj.__pid__]
    : (this.hash[obj.__pid__] = Object.create(obj));
};

module.exports = PrivateParts;
