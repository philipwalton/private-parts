Private Parts
=============

[![Build Status](https://secure.travis-ci.org/philipwalton/private-parts.png)](https://travis-ci.org/philipwalton/private-parts)

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [How It Works](#how-it-works)
4. [Browser and Environment Support](#browser-and-environment-support)
5. [Building and Testing](#building-and-testing)

The Private Parts module provides a simple and intuitive way to shim private properties and methods in JavaScript. It's small, easy to use, requires minimal setup, and works in both node and the browser.

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

The first example used `this._mileage` to reference the "private" mileage property of each instance. In the second example, all occurances of `this._mileage` have been replaced with `_(this).mileage`. As a result, `mileage` is never actually a property of `this`, so it can't be tampered with.

```javascript
var honda = new Car();
console.log(honda.mileage); // undefined
```

## How it works

If you look at the Private Parts example in the example above, you'll notice that the `this` context is wrapped in the `_()` function whenever it needs to access private data.

I call this function the "key function" or often just the "key".

### The Key Function

The key function is very simple to use. It accepts an object and returns a new object that is uniquely linked to the passed object, yet inaccessible without the key function itself. From here on, I will refer to the passed object as the "public instance" and the returned object as the "private instance".

You can create the key function by calling `createKey()`, the sole method provided by the Private Parts module. I usually assign the key to the `_` variable (since an underscore is only one character and often used to denote privacy) but you can choose any variable you like.

The key (like any variable in JavaScript) is only accessible to the scope it's defined in. This is what makes private properties possible. The key has access to the private instance, but outside code does not have access to the key.

### Using the Key

The first step is to create the key. Make sure to pay attention to the scope you're in. If you're in the browser, make sure you don't accidentally expose the key to the global scope.

The second step is to use the key to get and set properties. Any time you want a property to be private, use the key to set that property on the private instance. Since it's actually private, you'll need to create getters and setters to access it.

```javascript
var _ = require('private-parts').createKey();

function MyClass() {
  // `privateProperty` is not accessible outside this module
  _(this).privateProperty = 'bar';
}

MyClass.prototype.getPrivateProperty = function() {
  return _(this).privateProperty;
}

MyClass.prototype.setPrivateProperty = function(value) {
  return _(this).privateProperty = value;
}
```

Note that you don't need to check if the private instance exists before using it. The key function automatically creates a private instance if one doesn't exsits, and it return the private instance if it does.

### Private Methods

Private methods have always been semi-possible in JavaScript thanks to dynamic `this` and the function methods `call` and `apply`:

```javascript
// Some function in a closure.
function privateMethod() {
  this.doSomething();
}

// The prototype method can call the private method
// and retain the `this` context.
SomeClass.prototype.publicMethod = function() {
  privateMethod.call(this);
}
```

But using `call` or `apply` isn't as convienent as invoking a private method directly on an object, plus it doesn't allow for chaining of multiple methods together.

Private Parts has a solution to this problem.

The `createKey` function accepts an optional parameter that, when passed, is used as the prototype for any private instances created by that key. This object becomes a sort of "private prototype". It's accessible to all of the private intances but not to any of the public ones.

```javascript
var privateMethods = {
  privateMethodOne: function() { /* ... */ },
  privateMethodTwo: function() { /* ... */ }
}

var _ = require('private-parts').createKey(privateMethods);

SomeClass.prototype.publicMethod = function() {
  // Now the private methods can be invoked
  // directly on the private instances.
  _(this).privateMethodOne();
  _(this).privateMethodOne();
}
```

Most strategies for making private methods in JavaScript involve each new instance getting a copy of each method. This approach is far more efficient because the private methods object is instead set in the prototype chain, so only one copy is ever made, no matter how many new instances are created.

It's worth noting that in some cases, a private method might need to call a public method. In order for that to work, the private methods object needs to have the constructor's prototype in its prototype chain. That will enable the `this` context within private methods to have access to both private and public methods. Here's what that looks like:

```javascript
var privateMethods = Object.create(SomeClass.prototype);
privateMethods.privateMethodOne = function() { /* ... */ };
privateMethods.privateMethodTwo = function() { /* ... */ };
```

Hopefully this isn't too confusing, but in case it is, the next section will visually show what the prototype chain looks like in each of these three scenarios.

### The Prototype Chain

When you create the key function by passing a private methods object to `createKey(privateMethods)`, each private instance created with that key function will have the private methods object as its prototype.

```javascript
var privateMethods = { /* ... */ };
var _ = require('private-parts').createKey(privateMethods);

// Now the prototype chain looks like this:
_(this)  >>>  privateMethods
```

If you do not pass an object to the `createKey()` function, then private instances will set their corresponding public instance as their prototype.

```javascript
var _ = require('private-parts').createKey();

// Now the prototype chain looks like this:
_(this)  >>>  this  >>>  SomeClass.prototype
```

To get the best of both worlds, you can create a private methods object that has the constructor's prototype as its prototype:

```javascript
var privateMethods = Object.create(SomeClass.prototype, { /* ... */ };
var _ = require('private-parts').createKey(privateMethods);

// Now the prototype chain looks like this:
_(this)  >>>  privateMethods  >>>  SomeClass.prototype
```

You may notice that when you use a private methods object, the public instance (i.e. `this`) is not in the prototype chain. This means that if you want to use private methods, you can't also store public properties (own properties) on the public instance and have them be accessible to private instances via the prototype lookup chain. This is usually not a problem though, since most of the time all instance members are private. Getters and setters can always be used when public access is needed.

### A Complete Example

The following is a complete example that showcases both private properties and methods:

```javascript
function Car() {
  _(this).mileage = 0;
  _(this).mileageAtLastOilChange = 0;
  _(this).mileageAtLastTireRotation = 0;
}

// Add methods to the public prototype.
Car.prototype.drive = function(miles) {
  if (typeof miles == 'number' && miles > 0) {
    _(this).mileage += miles;
  } else {
    throw new Error('drive only accepts positive numbers');
  }
};

Car.prototype.getMileage = function() {
  return _(this).mileage;
}

Car.prototype.getMilesSinceLastOilChange = function() {
  return _(this).mileage - _(this).mileageAtLastOilChange;
}

Car.prototype.getMilesSinceLastTireRotation = function() {
  return _(this).mileage - _(this).mileageAtLastTireRotation;
}

Car.prototype.changeOil = function() {
  if ( _(this).shouldChangeOil() ) {
    _(this).mileageAtLastOilChange = _(this).mileage;
  } else {
    return("No oil change is needed at this time.")
  }
}

Car.prototype.rotateTires = function() {
  if ( _(this).shouldRotateTires() ) {
    _(this).mileageAtLastTireRotation = _(this).mileage;
  } else {
    return("No tire rotation is needed at this time.")
  }
}

// Create the "private prototype".
var privateMethods = Object.create(Car.prototype);

// Add methods to the "private prototype".
privateMethods.shouldChangeOil = function() {
  return this.getMilesSinceLastOilChange() > 5000 ? true : false
};

privateMethods.shouldRotateTires = function() {
  return this.getMilesSinceLastTireRotation() > 5000 ? true : false
};

// Create the key function with setting the private methods.
var _ = require('private-parts').createKey(privateMethods);

module.exports = Car;
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

Private Parts has been tested and known to work in the following environments:

* Node.js
* Chrome 6+
* Firefox 4+
* Safari 5.1+
* Internet Explorer 9+
* Opera 12+

Private Parts works in both Node and the browser. It uses the UMD pattern, so it can be included in your application as either an AMD module or a global variable.

It's important to note that Private Parts uses the [ES6 WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) data structure. **If you need to support an environment without WeakMaps, you can still use Private Parts, you just have to include one of the many available polyfills**.

I use this [WeakMap Polyfill](https://github.com/Benvie/WeakMap) by Brandon Benvie of Mozilla, which give me the browser support I list above. If you need better support you should use a different polyfill along with an ES5 shim (for IE8 and lower).

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
define(['parth/to/private-parts.js'], function(PrivateParts) {

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
<script src="path/to/weakmap.js"></script>
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
