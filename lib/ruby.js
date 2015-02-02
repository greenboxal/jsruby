var Reflect = require('harmony-reflect');
var util = require('./util');

// MissingPropertyTrap
var MissingPropertyTrapTarget = Object.create(null);
var MissingPropertyTrap = new Proxy(MissingPropertyTrapTarget, {
	get: function(target, name, receiver) {
		if (name == '__missingProperty__') {
			throw new Error("WTF");
		}

		return receiver.__missingProperty__(name);
	}
});

// BasicObject
var BasicObject = function BasicObject(){};

BasicObject.prototype = Object.create(MissingPropertyTrap, {
	constructor: {
		enumerable: false,
		writable: false,
		readable: true,
		value: BasicObject
	},
	__missingProperty__: {
		enumerable: false,
		readable: true,
		writable: true,
		value: function(name) { return undefined; }
	}
});

util.copyAllProperties(Object.prototype, BasicObject.prototype, ['constructor']);

// Object
Object.setPrototypeOf(Object.prototype, BasicObject.prototype);

util.deleteAllProperties(Object.prototype, ['constructor']);

// Module
var Module = function Module(){
	return Module.create.apply(Module, arguments);
};

util.inheritPrototype(Module, Object);

// Class
var Class = function Class(){
	return Class.create.apply(Class, arguments);
};

util.inheritPrototype(Class, Module);

// Patch metaclasses
util.patchMetaclass(BasicObject, undefined, Class.prototype, 'BasicObject');
util.patchMetaclass(Object, BasicObject, BasicObject.metaclass, 'Object');
util.patchMetaclass(Module, Object, Object.metaclass, 'Module');
util.patchMetaclass(Class, Module, Module.metaclass, 'Class');

// Export classes
global.BasicObject = BasicObject;
global.Module = Module;
global.Class = Class;

