var util = require('./util');

// BasicObject
var BasicObject = function BasicObject(){};

BasicObject.prototype = Object.create(null, {
	constructor: {
		enumerable: false,
		writable: false,
		readable: true,
		value: BasicObject
	}
});

util.copyAllProperties(Object.prototype, BasicObject.prototype, ['constructor']);

// Object
Object.prototype.__proto__  = BasicObject.prototype;

util.deleteAllProperties(Object.prototype, ['constructor']);

// Module
var Module = function Module(){};

util.inheritPrototype(Module, Object);

// Class
var Class = function Class(){};

util.inheritPrototype(Class, Module);

// Patch metaclasses
util.patchMetaclass(BasicObject, null, Class.prototype, 'BasicObject');
util.patchMetaclass(Object, BasicObject, BasicObject.metaclass, 'Object');
util.patchMetaclass(Module, Object, Object.metaclass, 'Module');
util.patchMetaclass(Class, Module, Module.metaclass, 'Class');
util.patchMetaclass(Function, Class, Class.metaclass, 'Function');

// Export classes
global.BasicObject = BasicObject;
global.Module = Module;
global.Class = Class;

global.debugChain = function(obj) {
	var i = 0;

	while (obj) {
		console.log(i + ':', obj.name ? obj.name : (obj.constructor ? obj.constructor.name : obj.name));
		obj = obj.__proto__;
		i++;
	}
};

