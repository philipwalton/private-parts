function PrivatePart(proto) {
  this.proto = proto;
  this.privateStore = new WeakMap();
  this.publicStore = new WeakMap();
}

PrivatePart.prototype.getPrivateInstance = function(publicInstance) {

  // If this object is in `publicStore` that means it's already
  // a private instance and should simply be returned.
  if (this.publicStore.has(publicInstance)) return publicInstance;

  // If this object does not have a private instance, create one.
  if (!this.privateStore.has(publicInstance)) {

    var privateInstance = Object.create(
      this.proto || Object.getPrototypeOf(publicInstance)
    );

    // Link `publicInstance` to the private instance in `privateStore`.
    this.privateStore.set(publicInstance, privateInstance);

    // Store the fact that `privateInstance` exists, so it doesn't get
    // double-privatized. For example `_(_(publicInstance))` should always
    // equal `_(publicInstance)`.
    this.publicStore.set(privateInstance, true);

    return privateInstance;
  }

  // Otherwise return the existing private instance.
  else {
    return this.privateStore.get(publicInstance);
  }
};

module.exports = PrivatePart;
