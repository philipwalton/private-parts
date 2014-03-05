function PrivateParts() {
  this.weakmap = new WeakMap();
}

PrivateParts.prototype.get = function(obj) {
  if (!this.weakmap.has(obj)) this.weakmap.set(obj, Object.create(obj));
  return this.weakmap.get(obj);
};

module.exports = PrivateParts;
