Private Parts
=============

[![Build Status](https://secure.travis-ci.org/philipwalton/private-parts.png)](https://travis-ci.org/philipwalton/private-parts)

1. [Introduction](#introduction)
2. [How It Works](#how-it-works)
3. [API](#api)
4. [Installation](#installation)
5. [Browser and Environment Support](#browser-and-environment-support)
6. [Building and Testing](#building-and-testing)

The Private Parts module provides a simple and intuitive way to shim private methods and properties in JavaScript. It's small, easy to use, requires minimal setup, and works in both node and the browser.

For more information on how Private Parts works and the problems it solves, see my [article introducing it](#).

## Introduction

Most people deal with private properties in JavaScript by prefixing them with an underscore and hoping that everyone using their library understands and respects this convention.

Consider the following example:

```javascript
function Car() {
  this._mileage = 0;
}

Car.prototype.drive(miles) {
  if (typeof miles == 'number' && miles > 0) {
    this._mileage += miles;
  } else {
    throw new Error('drive only accepts positive numbers');
  }
}

Car.prototype.readMileage() {
  return this._mileage;
}
```

This is okay, but anyone familiar with JavaScript will easily spot the problem: the validation check in the `drive` method is essentially useless. Anyone with access to the Car instance could easily set `_mileage` to whatever they want.

```javascript
var honda = new Car();
honda._mileage = 'pwned';
```

### A Better Way

Here's how you solve this problem and get real privacy using Private Parts. Notice that the code is almost exactly the same:

```javascript
var _ = require('private-parts').createKey();

function Car() {
  _(this).mileage = 0;
}

Car.prototype.drive(miles) {
  if (typeof miles == 'number' && miles > 0) {
    _(this).mileage += miles;
  } else {
    throw new Error('drive only accepts positive numbers');
  }
}

Car.prototype.readMileage() {
  return _(this).mileage;
}
```

The first example used `this._mileage` to reference the "private" mileage property of each instance. In the second example, all occurrences of `this._mileage` have been replaced with `_(this).mileage`. As a result, `mileage` is never actually a property of `this`, so it can't be tampered with.

```javascript
var honda = new Car();
console.log(honda.mileage); // undefined
```

## How it works

If you look at the Private Parts example in the code above, you'll notice that the `this` context is wrapped in the `_()` function whenever it needs to access private data.

I call `_()` the "key function" or often just the "key".

### The Key Function

The key function is very simple to use. It accepts an object and returns a new object that is uniquely linked to the passed object, yet inaccessible without the key function itself. From here on, I will refer to the passed object as the "public instance" and the returned object as the "private instance".

You can create the key function by calling `createKey()`, the sole method provided by the Private Parts module. I usually assign the key to the `_` variable (since an underscore is only one character and often used to denote privacy) but you can choose any variable you like.

The key (like any variable in JavaScript) is only accessible to the scope it's defined in. This is what makes private properties possible. The key has access to the private instance, but outside code does not have access to the key.

### Using the Key

The first step is to create the key. Make sure to pay attention to the scope you're in. If you're in the browser, make sure you don't accidentally expose the key to the global scope.

The second step is to use the key to get and set properties. Any time you want a property to be private, use the key to set that property on the private instance. Since it's actually private, you'll need to create getters and setters to access it from any public scope.

```javascript
var _ = require('private-parts').createKey();

function SomeClass() {
  // `privateProperty` is not accessible outside this module
  _(this).privateProperty = 'bar';
}

SomeClass.prototype.getPrivateProperty = function() {
  return _(this).privateProperty;
}

SomeClass.prototype.setPrivateProperty = function(value) {
  return _(this).privateProperty = value;
}
```

Note that you don't need to check if the private instance exists before using it. The key function automatically creates a private instance if one doesn't exist, and it returns the private instance if it does.

### Controlling the Prototype Chain

When you pass a public instance to the key function and get a private instance back, the private instance (by default) will be a plain old JavaScript object.

```javascript
var _ = require('private-parts').createKey();

// The prototype chain looks like this:
_(this)  >>>  Object.prototype
```

This is okay for some situations, but if your private instance needs to access any prototype methods, this won't work.

Luckily, this behavior can be changed. The `createKey` function takes an optional argument that can be used to control how private instances are created. If the optional argument is an object, new private instances will be created with that object as their prototype. (Note, the optional argument can also be a function, for more information on passing a function to `createKey`, see the [API](#api) section.)

To give your private instances access to the public prototype, simply pass the prototype to `createKey`.

```javascript
var _ = require('private-parts').createKey(SomeClass.prototype);

// The prototype chain now looks like this:
_(this)  >>>  SomeClass.prototype
```

There's actually a lot more power here than may be initially apparent. Being able to set the prototype of the private instances gives you the ability to create a set of shared methods that are accessible to private instances but not public ones. Essentially, you can create a private prototype!

```javascript
var privateMethods = { /* ... */ };
var _ = require('private-parts').createKey(privateMethods);

// Now the prototype chain now looks like this:
_(this)  >>>  privateMethods
```

Taking this one step further, if the private methods object is created with the public prototype as its prototype (using `Object.create`), your private instances will now have access to both public and private methods.

```javascript
var privateMethods = Object.create(SomeClass.prototype, { /* ... */ };
var _ = require('private-parts').createKey(privateMethods);

// The ultimate prototype chain.
_(this)  >>>  privateMethods  >>>  SomeClass.prototype
```

### A Complete Example

For a complete example that showcases both private properties and methods, check out the [Car fixture](https://github.com/philipwalton/private-parts/blob/master/test/fixtures/car.js) in the tests directory. This is the example class that many of the tests are based on.

## API

#### `_(obj)`

The key function, usually stored on the `_` (underscore) variable, acts as an accessor to the private store. It accepts an object (the "public instance") and returns the object associated with that passed object (the "private instance"). If no private instance counterpart exists, a new one is created.

The method in which new private instances are created is determined by the argument passed to the `createKey` factory method, as described next:

#### `createKey(fn)`

When `createKey` is passed a function, that function is used to create new private instances (when the key function receives a public instance it's never seen before). The passed function (the creator function) is invoked with the public instance as its first argument.

For example, if you wanted all private instances to have a reference back to the public instance, you could do the following:

```javascript
var _ = createKey(function(publicInstance) {
  return { __public__: publicInstance };
})

_({foo:'bar'}) // returns { __public__: {foo:'bar'}}
```

#### `createKey(obj)`

When `createKey` receives an object instead of a function, it actually creates a function behind the scenes by binding the passed object to `Object.create`. This effectively means that newly created instances will have the object passed to `createKey` as their prototype:

```javascript
var someObj = { /* ... */ };

// Given `someObj`, the following two expressions are equivalent.
createKey(someObj);
createKey(Object.create.bind(null, someObj, {}));
```

#### `createKey()`

If nothing is passed to `createKey`, a plain old JavaScript object is created.

```javascript
// The following three expressions are equivalent.
createKey();
createKey(Object.prototype);
createKey(Object.create.bind(null, Object.prototype, {}));
```

## Installation

Private Parts is incredibly small. It's less than 1K minified and gzipped.

To install from NPM:

```sh
npm install --save private-parts
```

From Bower:

```sh
bower install --save private-parts
```

## Browser and Environment Support

Private Parts has [been tested](https://ci.testling.com/philipwalton/private-parts) and known to work in the following environments. Older browser support (including IE8 and lower) is likely possible with the right polyfills.

* Node.js
* Chrome 6+
* Firefox 4+
* Safari 5.1+
* Internet Explorer 9+
* Opera 12+

Private Parts works in both Node and the browser. It uses the UMD pattern, so it can be included in your application as either an AMD module or a global variable.

It's important to note that Private Parts uses the [ES6 WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) data structure. **If you need to support an environment without WeakMaps, you can still use Private Parts, you just have to include one of the many available polyfills**.

I use this [WeakMap Polyfill](https://github.com/Benvie/WeakMap) by Brandon Benvie of Mozilla, which gives me the browser support I list above. If you need better support you should use a different polyfill along with an ES5 shim (for IE8 and lower).

For a list of environments that support WeakMap natively, see [Kangax's ES6 compatibility tables](http://kangax.github.io/es5-compat-table/es6/#WeakMap).

### Usage Examples

In node:

```javascript
var _ = require('private-parts').createKey();

function Car() {
  _(this).mileage = 0;
}

// ...

module.exports = Car;
```

In the browser via AMD:

```javascript
define(['parth/to/private-parts'], function(PrivateParts) {

  var _ = PrivateParts.createKey();

  function Car() {
    _(this).mileage = 0;
  }

  // ...

  return Car;
})
```

In the browser via globals:

```javascript
var Car = (function() {

  var _ = PrivateParts.createKey();

  function Car() {
    _(this).mileage = 0;
  }

  // ...

  return Car;
}());
```

### With a Polyfill

In node:

```javascript
// Put this code year the main entry point of your app.
if (!('WeakMap' in global)) global.WeakMap = require('weapmap');
```

In the browser:

```xml
<!-- needed for most browsers -->
<script src="path/to/weakmap.js"></script>

<!-- if you need to support really old browsers -->
<script src="path/to/es5-shim.js"></script>

<script src="path/to/private-parts.js"></script>
```

## Building and Testing

To run the tests and build the browser version of the library, use the following commands:

```sh
# Run the node and browser tests.
make test

# Build the browser version.
make build

# Test and build.
make
```

Private Parts uses [Browserify](http://browserify.org/) to build the browser version of the library as well as browser versions of the tests. It uses [Travic-CI](https://travis-ci.org/) to run the tests in Node.js and [Testling](https://ci.testling.com/) to run the tests in actual browsers on each commit.
