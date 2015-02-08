
module.exports 

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
var Module = function Module() {
	return Module.create.apply(Module, arguments);
};

util.inheritPrototype(Module, Object);

// Class
var Class = function Class() {
	return Class.create.apply(Class, arguments);
};

util.inheritPrototype(Class, Module);

// Patch metaclasses
util.patchMetaclass(BasicObject, undefined, Class.prototype, 'BasicObject');
util.patchMetaclass(Object, BasicObject, BasicObject.metaclass, 'Object');
util.patchMetaclass(Module, Object, Object.metaclass, 'Module');
util.patchMetaclass(Class, Module, Module.metaclass, 'Class');

// Patch native classes
util.patchNativeClass(Boolean, Object);
util.patchNativeClass(Number, Object);
util.patchNativeClass(Date, Object);
util.patchNativeClass(Math, Object);
util.patchNativeClass(String, Object);
util.patchNativeClass(RegExp, Object);
util.patchNativeClass(Array, Object);
util.patchNativeClass(Int8Array, Object);
util.patchNativeClass(Uint8Array, Object);
util.patchNativeClass(Uint8ClampedArray, Object);
util.patchNativeClass(Int16Array, Object);
util.patchNativeClass(Uint16Array, Object);
util.patchNativeClass(Int32Array, Object);
util.patchNativeClass(Uint32Array, Object);
util.patchNativeClass(Float32Array, Object);
util.patchNativeClass(Float64Array, Object);
util.patchNativeClass(ArrayBuffer, Object);
util.patchNativeClass(DataView, Object);
util.patchNativeClass(JSON, Object);
util.patchNativeClass(Function, Object);
util.patchNativeClass(Error, Object);
util.patchNativeClass(EvalError, Error);
util.patchNativeClass(RangeError, Error);
util.patchNativeClass(ReferenceError, Error);
util.patchNativeClass(SyntaxError, Error);
util.patchNativeClass(URIError, Error);

// Export classes
global.BasicObject = BasicObject;
global.Module = Module;
global.Class = Class;

