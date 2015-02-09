var Ruby = require('./ruby');
var RubyClass = require('./class');

var dummyFunction = function(){};

// BasicObject
var basicObjectAlloc = function(klass) {
	return Object.create(klass.prototype);
};

// Object
var objectAlloc = function() {
	return exports.alloc(this);
};

// Kernel
var kernelGetMetaclass = function() {
	return RubyClass.getSingletonClass(this);
};

var kernelGetConstructor = function() {
	return RubyClass.getRealClass(RubyClass.getClass(this));
};

var kernelToString = function() {
	return Ruby.getObjectName(this);
};

// Module
var allocateModule = function(klass) {
	var mod = RubyClass.alloc(Ruby.Module);

	RubyClass.setClass(mod, klass);
	RubyClass.setFlags(mod, {
		module: true
	});

	return mod;
};

var moduleInitialize = function(name, fn) {
	if (name instanceof Function) {
		fn = name;
		name = null;
	}

	if (!name && fn) {
		name = fn.name;
	}

	RubyClass.setClassName(this, name);

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
		if (RubyClass.isIncludedClass(p)) {
			results.push(RubyClass.getClass(p));
		} else if (RubyClass.getClassOrigin(p) == p) {
			results.push(p);
		}
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

var classInitialize = function(name, superclass, fn) {
	if (RubyClass.getSuperclass(this) || this == Ruby.BasicObject) {
		throw new TypeError("already initialized class");
	}

	if (superclass instanceof Function) {
		fn = superclass;
		superclass = undefined;
	}

	if (name instanceof Class) {
		superclass = name;
		name = undefined;
	}

	if (!name && fn) {
		name = fn.name;
	}

	if (!superclass) {
		superclass = Ruby.Object;
	} else if (superclass != Ruby.BasicObject && !RubyClass.getSuperclass(superclass)) {
		throw new TypeError("can't inherit uninitialized class");
	}

	RubyClass.setClassName(this, name);
	RubyClass.setSuperclass(this, superclass);
	RubyClass.makeMetaclass(this);
	RubyClass.callInherited(superclass, this);

	moduleInitialize.call(this, name, fn);

	return this;
};

var classGetSuperclass = function() {
	var superclass = RubyClass.getSuperclass(this);

	if (!superclass) {
		if (this == Ruby.BasicObject) {
			return null;
		}

		throw new TypeError("uninitialized class");
	}
	
	while (RubyClass.isIncludedClass(superclass)) {
		superclass = RubyClass.getSuperclass(superclass);
	}

	return superclass;
};

exports.isKindOf = function(obj, c) {
	var cl = RubyClass.getClass(obj);

	c = RubyClass.getClassOrigin(c);

	while (cl) {
		if (cl == c || cl.prototype == c.prototype) {
			return true;
		}

		cl = RubyClass.getSuperclass(cl);
	}

	return false;
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

	if (kernelGetConstructor.call(obj) != RubyClass.getRealClass(klass)) {
		throw new TypeError("wrong instance allocation");
	}

	return obj;
};

exports.init = function() {
	RubyClass.initHierarchy();

	// BasicObject
	RubyClass.defineMethod(Ruby.BasicObject, "initialize", dummyFunction);
	RubyClass.defineAllocFunction(Ruby.BasicObject, basicObjectAlloc);

	// Module
	RubyClass.defineAllocFunction(Ruby.Module, allocateModule);
	RubyClass.defineProperty(Ruby.Module, "name", moduleGetName);
	RubyClass.defineProperty(Ruby.Module, "ancestors", moduleGetAncestors);
	RubyClass.defineMethod(Ruby.Module, "initialize", moduleInitialize);
	RubyClass.defineMethod(Ruby.Module, "toString", moduleToString);

	// Class
	RubyClass.defineMethod(Ruby.Class, "allocate", objectAlloc);
	RubyClass.defineMethod(Ruby.Class, "create", classCreate);
	RubyClass.defineMethod(Ruby.Class, "initialize", classInitialize);
	RubyClass.defineProperty(Ruby.Class, "superclass", classGetSuperclass);
	RubyClass.defineAllocFunction(Ruby.Class, classAlloc);
	RubyClass.undefineMethod(Ruby.Class, "extendObject");
	RubyClass.undefineMethod(Ruby.Class, "appendFeatures");

	// Kernel
	Ruby.Kernel = Ruby.defineModule('Kernel');
	RubyClass.includeModule(Ruby.Object, Ruby.Kernel);
	RubyClass.defineMethod(Ruby.Class, "inherited", dummyFunction);
	RubyClass.defineMethod(Ruby.Module, "included", dummyFunction);
	RubyClass.defineMethod(Ruby.Module, "extended", dummyFunction);
	RubyClass.defineMethod(Ruby.Module, "prepended", dummyFunction);

	RubyClass.defineProperty(Ruby.Kernel, "metaclass", kernelGetMetaclass);
	RubyClass.defineProperty(Ruby.Kernel, "constructor", kernelGetConstructor);
	RubyClass.defineMethod(Ruby.Kernel, "toString", kernelToString);
};

