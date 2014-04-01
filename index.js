/**
 * A function that returns a function that allows you to associate
 * a public object with its private counterpart.
 * @param {Function|Object} factory An optional argument that, is present, will
 *   be used to create new objects in the store.
 *   If factory is a function, it will be invoked with the key as an argument
 *   and the return value will be the private instance.
 *   If factory is an object, the private instance will be a new object with
 *   factory as it's prototype.
 */
function createKey(factory){

  // Create the factory based on the type of object passed.
  factory = typeof factory == 'function'
    ? factory
    : createBound(factory);

  // Store is used to map public objects to private objects.
  var store = new WeakMap();

  // Seen is used to track existing private objects.
  var seen = new WeakMap();

  /**
   * An accessor function to get private instances from the store.
   * @param {Object} key The public object that is associated with a private
   *   object in the store.
   */
  return function(key) {
    if (typeof key != 'object') return;

    var value = store.get(key);
    if (!value) {
      // Make sure key isn't already the private instance of some existing key.
      // This check helps prevent accidental double privatizing.
      if (seen.has(key)) {
        value = key;
      } else {
        value = factory(key);
        store.set(key, value);
        seen.set(value, true);
      }
    }
    return value;
  };
}

/**
 * Function.prototype.bind doesn't work in PhantomJS or Safari 5.1,
 * so we have to manually bind until support is dropped.
 * This function is effectively `Object.create.bind(null, obj, {})`
 * @param {Object} obj The first bound parameter to `Object.create`
 * @return {Function} The bound function.
 */
function createBound(obj) {
  return function() {
    return Object.create(obj || Object.prototype);
  };
}

module.exports = {
  createKey: createKey
};
