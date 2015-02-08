var Ruby = require('./ruby');
var RubyClass = require('./class');
var RubyModule = require('./module');

var dummyFunction = function(){};

// BasicObject
var basicObjectAlloc = function(klass) {
	return Object.create(klass.prototype);
};

// Object
var objectAlloc = function() {
	return exports.alloc(this);
};

var objectGetMetaclass = function() {
	return RubyClass.getSingletonClass(this);
};

var objectGetConstructor = function() {
	return RubyClass.getRealClass(RubyClass.getClass(this));
};

var objectToString = function() {
	return Ruby.getObjectName(this);
};

// Module
var allocateModule = function(klass) {
	var mod = RubyModule.create();

	RubyClass.setClass(mod, klass);

	return mod;
};

var moduleInitialize = function(fn) {
	if (fn) {
		fn.call(this);
	}
};

var moduleGetName = function() {
	return RubyClass.getClassName(this);
};

var moduleGetAncestors = function() {
	var results = [];

	for (var p = this; p; p = RubyClass.getSuperclass(p)) {
		results.push(p);
	}

	return results;
};

var moduleToString = function() {
	var intern = this.__iclass__;

	if (intern && intern.singleton) {
		var name;
		var owner = RubyClass.getAttachedSingletonClass(this);

		if (owner instanceof Ruby.Module || owner instanceof Ruby.Class) {
			name = owner.toString();
		} else {
			name = typeof owner;
		}

		return "#<Class:" + name + ">";
	}

	return RubyClass.getClassName(this);
};

// Class
var classAlloc = function(klass) {
	return RubyClass.boot(null);
};

var classCreate = function() {
	var obj = exports.alloc(this);

	exports.callInitializer(obj, arguments);

	return obj;
};

var classInitialize = function(superclass, fn) {
	if (RubyClass.getSuperclass(this) || this == Ruby.BasicObject) {
		throw new TypeError("already initialized class");
	}

	if (superclass instanceof Function) {
		fn = superclass;
		superclass = undefined;
	}

	if (!superclass) {
		superclass = Ruby.Object;
	} else if (superclass != Ruby.BasicObject && !RubyClass.getSuperclass(superclass)) {
		throw new TypeError("can't inherit uninitialized class");
	}

	RubyClass.setSuperclass(this, superclass);
	RubyClass.makeMetaclass(this);
	RubyClass.callInherited(superclass, this);

	moduleInitialize.call(this, fn);

	return this;
};

var classGetSuperclass = function() {
	return RubyClass.getSuperclass(this);
};

exports.callInitializer = function(obj, args) {
	obj.initialize.apply(obj, args);
};

exports.alloc = function(klass) {
	var allocator = RubyClass.getAllocFunction(klass);

	if (!RubyClass.getSuperclass(klass) && klass != Ruby.BasicObject) {
		throw new TypeError("can't instantiate uninitialized class");
	}

	if (RubyClass.isSingletonClass(klass)) {
		throw new TypeError("can't create instance of singleton class")
	}

	if (!allocator) {
		throw new TypeError("allocator undefined for " + RubyClass.getClassName(klass));
	}

	var obj = allocator(klass);

	if (objectGetConstructor.call(obj) != RubyClass.getRealClass(klass)) {
		throw new TypeError("wrong instance allocation");
	}

	return obj;
};

exports.init = function() {
	RubyClass.initHierarchy();

	// BasicObject
	RubyClass.defineMethod(Ruby.BasicObject, "initialize", dummyFunction);
	RubyClass.defineAllocFunction(Ruby.BasicObject, basicObjectAlloc);

	// Object
	RubyClass.defineProperty(Ruby.Object, "metaclass", objectGetMetaclass);
	RubyClass.defineProperty(Ruby.Object, "constructor", objectGetConstructor);
	RubyClass.defineMethod(Ruby.Object, "toString", objectToString);

	// Kernel

	// Module
	RubyClass.defineAllocFunction(Ruby.Module, allocateModule);
	RubyClass.defineProperty(Ruby.Module, "name", moduleGetName);
	RubyClass.defineProperty(Ruby.Module, "ancestors", moduleGetAncestors);
	RubyClass.defineMethod(Ruby.Module, "toString", moduleToString);

	// Class
	RubyClass.defineMethod(Ruby.Class, "allocate", objectAlloc);
	RubyClass.defineMethod(Ruby.Class, "create", classCreate);
	RubyClass.defineMethod(Ruby.Class, "initialize", classInitialize);
	RubyClass.defineMethod(Ruby.Class, "inherited", dummyFunction);
	RubyClass.defineProperty(Ruby.Class, "superclass", classGetSuperclass);
	RubyClass.defineAllocFunction(Ruby.Class, classAlloc);
};

