!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.PrivateParts=e()}}(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}({1:[function(_dereq_,module,exports){var PrivatePart=_dereq_("./lib/private-part");module.exports={createKey:function(privateMethods){var privates=new PrivatePart(privateMethods);return function createKey(instance){return privates.get(instance)}}}},{"./lib/private-part":2}],2:[function(_dereq_,module,exports){function PrivatePart(privateMethods){this.privateMethods=privateMethods;this.privateStore=new WeakMap;this.publicStore=new WeakMap}PrivatePart.prototype.get=function(obj){if(this.publicStore.has(obj))return obj;if(!this.privateStore.has(obj)){var privateInstance=Object.create(this.privateMethods||obj);this.privateStore.set(obj,privateInstance);this.publicStore.set(privateInstance,true);return privateInstance}else{return this.privateStore.get(obj)}};module.exports=PrivatePart},{}]},{},[1])(1)});