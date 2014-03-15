function PrivatePart() {
  this.weakmap = new WeakMap();
}

PrivatePart.prototype.get = function(obj) {
  if (!this.weakmap.has(obj)) this.weakmap.set(obj, Object.create(obj));
  return this.weakmap.get(obj);
};

module.exports = PrivatePart;
