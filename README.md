Private Parts
=============

[![Build Status](https://secure.travis-ci.org/philipwalton/private-parts.png)](http://travis-ci.org/philipwalton/private-parts)

In JavaScript the only way to make something private is to put it in a scope that other parts of the code don't have access to. There is no way to specify that particular properties of an object are private and as a result it's impossible to have *true* private instance variables.

Private Parts fakes private instance variables and provides a clean and intuitive way to interact with them that is almost identical to accessing regular properties.

Maybe developers use an underscore to signal to other developers that a variable is private. In the spirit of that convention, and with a few extra characters we can make something that actually *is* private.

With the private parts module, you can assign and read properties on any object and those properties are actually private! All you have to do is instantiate a privacy wrapper in a particular scope, and then you can simply so that wrapper to get or set whatever properties you want on any object.

Here's an example:

```js
var _ = require('private-parts').scope();
var obj = {}

// I'm public
obj.name = 'John Doe'

// I'm private
_(obj).sex = 'Male'

// The `sex` property is not actually stored on `obj`
console.log(obj.name); // 'Jon Doe'
console.log(obj.sex); // undefined

// But you can still access it in the current scope
console.log(_(obj).sex); // 'Male'
```

That's it. There's no setup, and you don't even have to declare a variable as private or public. You just have to use the wrapper when accessing it.

### But is that actually private?

You're probably thinking that if you can access a private property using the same wrapper you use to see it, e.g. `_(obj).prop`, how is that any different than before?

The difference is that the `_()` function is local to the current scope. You can pass the object around to different scopes, but as long as you don't pass the `_` variable along with it, no one will be able to access those private properties.

## The Getter and Setter Pattern

If you want to implement getters and setters like you can do in many other langues, here's how you could do it.

```js
var _ = require('..').scope();

function MyObj() {

  // This is a public property. It will be access to
  // anyone who has access to the instance.
  this.pub = 'I am public.';

  // This is a private property. It's not accessible outside
  // of this scope of the `_` variable required above
  _(this).priv = 'I am private.';
}

MyObj.prototype.getPriv = function() {
  return _(this).priv;
};

MyObj.prototype.setPriv = function(value) {
  _(this).priv = value;
};

module.exports = MyObj;
```

Then, in another file, if you create an instance of `MyObj` you'll see that you can access its public property, but not its private property. And the getters and setters works just like you'd expect.

```js
var MyObj = require('./my-obj.js');

// Public properties can be seen as normal.
console.log(obj.pub) // 'I am public.'

// Private properties are not accessible.
console.log(obj.priv) // undefined);

// The getters and setters work just you'd expect
console.log(obj.getPriv())) // 'I am private.'

obj.setPriv('I have been set!');
console.log(obj.getPriv()) // 'I have been set!');

// After using the getters and setters, the
// private property still can't be seen
console.log(obj.priv) // undefined);
```

### But weren't private variables always possible?

Private variables have always been possible, but private *instance* variables have never been possible. And by instance variables I mean properties of an object that can only be accessed in a particular scope.

Private instance variables are much more powerful than plain variable inside of a module closure because they are linked to a particular instance of an object.

## How it Works

Private parts works by creating a shadow object for each object it receives. The shadow object is stored in a closure so it's not accessible to any code other than through the `_()` function.

The shadow object is also created with the original object as it's prototype, which means that the shadow object has access to both public and private properties, which can be very helpful if one of your private properties is a function that uses the `this` keyword.

## WeakMap Shim

If you're using Node and for some reason you can't use the `--harmony` flag, you'll have to manually add a WeakMap shim yourself.

The weakmap module is what I use to do my browser testing on Testling. If you want to use it in node, follow these steps:

```sh
npm install --save weakmap
```

Then, somewhere in your application code, do something like this:

```js
if (!("WeakMap" in global)) global.WeakMap = require('weakmap');
```

I originally considered bundling this WeakMap shim with Private Parts, but I decided against it in favor of letting people choose their own shim. I may reconsider if enough people request it.


