Private Parts
=============

[![Build Status](//secure.travis-ci.org/philipwalton/private-parts.png)](http://travis-ci.org/philipwalton/private-parts)

1. [How It Works](#how-it-works)
2. [Browser and Environment Support](#browser-and-environment-support)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Building and Testing](#building-and-testing)

The Private Parts module provides a simple and intuitive way to achieve real property privacy in JavaScript. It's small, easy to use, requires minimal setup, and works in both node and the browser.

For more information on how Private Parts works and the problems it solves, see my article introducing it.

## How It Works

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

The first example used `this._mileage` to reference the private mileage property of each instance. In the second example, all occurances of `this._mileage` have been replaced with `_(this).mileage`. As a result, `mileage` is never actually a property of `this`, so it can't be tampered with.

```javascript
var honda = new Car();
console.log(honda.mileage); // undefined
```

This is made possible by using `_()`, which I call the "key function" or often just the "key".

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
  // `publicProperty` is accessible to anyone with the instance
  this.publicProperty = 'foo';

  // `privateProperty` is not accessible outside
  _(this).privateProperty = 'bar';
}

MyClass.prototype.getPrivateProperty = function() {
  return _(this).privateProperty;
}

MyClass.prototype.setPrivateProperty = function(value) {
  return _(this).privateProperty = value;
}
```

Note that you don't need to check if the private instance exists before using it. The key function automatically creates it if it doesn't exist and simply returns it if it does.

### The Prototype Chain

The private instance returned by the key function is created with the public instance as its prototype. This, for all intents and purposes, means that the private instance can basically be used exactly like the public instance (though not vise-versa).

This can be helpful if you assign a function to the private instance, and inside of that function you reference `this`, which in that context will be the private instance. Because the public instance is set as the prototype, the private instance will be able to reference all public instance properties as well as any properties of the instance constructor's prototype.

Here's what the prototype chain looks like for the `MyClass` example above:

```
_(this)  >>>  this  >>> MyClass.prototype
```

## Browser and Environment Support

[![Environment Support](//ci.testling.com/philipwalton/private-parts.png)](https://ci.testling.com/philipwalton/private-parts)

Private Parts works in both Node and the browser. It uses the UMD pattern, so it can be included in your application as either an AMD module or a global variable.

It's important to note that Private Parts uses the [ES6 WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) data structure. **If you need to support an environment without WeakMaps, you can still use Private Parts, you just have to include one of the many available polyfills**.

I use this [WeakMap Polyfill](https://github.com/Benvie/WeakMap) by Brandon Benvie of Mozilla, which supports IE9+. Others may have more comprehensive browser support.

For a list of environments that support WeakMap natively, see [Kangax's ES6 compatibility tables](http://kangax.github.io/es5-compat-table/es6/#WeakMap).

## Installation

Private Parts is incredibly small. It's 1.2K minified and only about 0.5K gzipped.

To install from NPM:

```sh
npm install --save private-parts
```

From Bower:

```sh
bower install --save private-parts
```

## Usage

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
if (!('WeakMap' in global)) global.WeakMap = require('some-weapmap-polyfill');
```

In the browser:

```xml
<script src="path/to/some-weakmap-polyfill.js"></script>
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

