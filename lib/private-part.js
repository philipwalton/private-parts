function PrivatePart(privateMethods) {
  this.privateMethods = privateMethods;
  this.privateStore = new WeakMap();
  this.publicStore = new WeakMap();
}

PrivatePart.prototype.get = function(obj) {
  // If this object is in `publicStore` that means it's already
  // a private instance and should simply be returned.
  if (this.publicStore.has(obj)) return obj;

  // Otherwise this object does not have a private instance, create one.
  if (!this.privateStore.has(obj)) {
    var privateInstance = Object.create(this.privateMethods || obj);
    // Link `obj` to the private instance in `privateStore`.
    this.privateStore.set(obj, privateInstance);
    // Store the fact that `privateInstance` exists, so it
    // doesn't get double-privatized.
    // For example `_(_(obj))` should always equal `_(obj)`.
    this.publicStore.set(privateInstance, true);

    return privateInstance;
  }
  // Otherwise return the existing private instance.
  else {
    return this.privateStore.get(obj);
  }
};

module.exports = PrivatePart;
