var Ruby = require('./ruby');
var setFunctionName = require('function-name');

var currentObjectId = 10000;
var fetchObjectId = function() {
	return (currentObjectId++).toString(16);
};

var haveMetaclass = function(klass) {
	var metaclass = exports.getClass(klass);

	return metaclass &&
		exports.isSingletonClass(metaclass) &&
		exports.getAttachedSingletonClass(metaclass) == klass;
};

var ensureMetaclass = function(klass) {
	if (haveMetaclass(klass)) {
		return exports.getClass(klass);
	} else {
		return makeMetaclass(klass);
	}
};

var makeMetaclass = function(klass) {
	var metaclass = exports.boot(null, 'Class:' + exports.getClassName(klass));

	metaclass.__iclass__.singleton = true;
	exports.setAttachedSingletonClass(metaclass, klass);

	if (exports.getClass(klass) == klass) {
		exports.setClass(klass, metaclass);
		exports.setClass(metaclass, metaclass);
	} else {
		var tmp = exports.getClass(klass);
		exports.setClass(klass, metaclass);
		exports.setClass(metaclass, ensureMetaclass(tmp));
	}

	var superclass = exports.getSuperclass(klass);
	exports.setSuperclass(metaclass, superclass ? ensureMetaclass(superclass) : Ruby.Class);

	return metaclass;
};

var makeSingletonClass = function(obj) {
	var origClass = exports.getClass(obj);
	var klass = exports.boot(origClass, 'Class:' + exports.getClassName(origClass) + ':' + fetchObjectId());

	klass.__iclass__.singleton = true;

	exports.setClass(obj, klass);
	exports.setAttachedSingletonClass(klass, obj);
	exports.setClass(klass, exports.getClass(exports.getRealClass(origClass)));

	return klass;
};

var singletonClassOf = function(obj) {
	if (obj instanceof Number) {
		throw new TypeError("can't define singleton");
	}

	if (haveMetaclass(obj)) {
		return exports.getClass(obj);
	} else {
		return exports.makeMetaclass(obj);
	}
};

var bootDefaultClass = function(name, superclass) {
	var obj = exports.boot(superclass, name);
	
	global[name] = obj;

	return obj;
};

var bootObjectClass = function(name, superclass) {
	exports.classify(Object, Ruby.Class, superclass, name);

	return Object;
};

exports.getClass = function(obj) {
	return obj.__class__ || null;
};

exports.setClass = function(obj, klass) {
	if (klass) {
		Object.setPrototypeOf(obj, klass.prototype);
	} else {
		Object.setPrototypeOf(obj, null);
	}
};

exports.getSuperclass = function(klass) {
	var intern = klass.__iclass__;

	if (!intern) {
		throw new TypeError("not a jsruby class");
	}

	return intern.superclass;
};

exports.setSuperclass = function(klass, superclass) {
	var intern = klass.__iclass__;

	if (!intern) {
		throw new TypeError("not a jsruby class");
	}

	intern.superclass = superclass;

	if (superclass) {
		Object.setPrototypeOf(klass.prototype, superclass.prototype);
	} else {
		Object.setPrototypeOf(klass.prototype, null);
	}
};

exports.getClassName = function(klass) {
	var intern = klass.__iclass__;

	if (!intern) {
		throw new TypeError("not a jsruby class");
	}

	return intern.name;
};

exports.setClassName = function(klass, name) {
	var intern = klass.__iclass__;

	if (!intern) {
		throw new TypeError("not a jsruby class");
	}

	intern.name = name;
	setFunctionName(intern.klass, name);
};

exports.getAllocFunction = function(klass) {
	var intern = klass.__iclass__;

	if (!intern) {
		throw new TypeError("not a jsruby class");
	}

	while (intern && !intern.allocator)
		intern = intern.superclass ? intern.superclass.__iclass__ : null;

	if (!intern)
		return null;

	return intern.allocator;
};

exports.defineAllocFunction = function(klass, fn) {
	var intern = klass.__iclass__;

	if (!intern) {
		throw new TypeError("not a jsruby class");
	}

	intern.allocator = fn;
};

exports.getAttachedSingletonClass = function(obj) {
	return obj.prototype.__attached__ || null;
};

exports.setAttachedSingletonClass = function(klass, obj) {
	Object.defineProperty(klass.prototype, '__attached__', {
		enumerable: false,
		writable: false,
		readable: true,
		value: obj
	});
};

exports.isSingletonClass = function(klass) {
	var intern = klass.__iclass__;

	if (!intern) {
		throw new TypeError("not a jsruby class");
	}

	return !!intern.singleton;
};

exports.getRealClass = function(klass) {
	if (!klass) {
		return null;
	}

	while (klass.__iclass__.singleton)
		klass = klass.__iclass__.superclass;

	return klass;
};

exports.callInherited = function(superclass, klass) {
	if (!superclass) {
		superclass = Ruby.Object;
	}
	
	superclass.inherited(klass);
};

exports.defineMethod = function(klass, name, fn) {
	Object.defineProperty(klass.prototype, name, {
		enumerable: false,
		writable: false,
		readable: true,
		value: fn
	});
};

exports.defineProperty = function(klass, name, get, set) {
	Object.defineProperty(klass.prototype, name, {
		enumerable: false,
		get: get,
		set: set
	});
};

exports.classify = function(obj, klass, superclass, name) {
	var intern = {};

	Object.defineProperty(obj, '__iclass__', {
		enumerable: false,
		configurable: false,
		writable: false,
		readable: true,
		value: intern
	});

	Object.defineProperty(obj.prototype, '__class__', {
		configurable: true,
		enumerable: false,
		writable: false,
		readable: true,
		value: obj
	});

	Object.defineProperty(intern, 'klass', {
		configurable: true,
		enumerable: false,
		writable: false,
		readable: true,
		value: obj
	});

	exports.setClassName(obj, name);
	exports.setClass(obj, klass);
	exports.setSuperclass(obj, superclass);
};

exports.alloc = function(klass, name) {
	var intern = {};

	var obj = new Function('return function $$jsr$' + fetchObjectId() + '(){ return arguments.callee.create.apply(arguments.callee, arguments); }')();

	exports.classify(obj, klass, null, name);

	return obj;
};

exports.boot = function(superclass, name) {
	var klass = exports.alloc(Ruby.Class, name);

	exports.setSuperclass(klass, superclass);

	return klass;
};

exports.makeMetaclass = function(klass) {
	if (klass instanceof Ruby.Class) {
		return makeMetaclass(klass);
	} else {
		return makeSingletonClass(klass);
	}
};

exports.getSingletonClass = function(obj) {
	var klass = singletonClassOf(obj);

	if (obj instanceof Ruby.Class) {
		ensureMetaclass(obj);
	}

	return klass;
};

exports.initHierarchy = function() {
	Ruby.BasicObject = bootDefaultClass("BasicObject", null);
	Ruby.Object = bootObjectClass("Object", Ruby.BasicObject);
	Ruby.Module = bootDefaultClass("Module", Ruby.Object);
	Ruby.Class = bootDefaultClass("Class", Ruby.Module);

	exports.setClass(Ruby.Class, Ruby.Class);
	exports.setClass(Ruby.Module, Ruby.Class);
	exports.setClass(Ruby.Object, Ruby.Class);
	exports.setClass(Ruby.BasicObject, Ruby.Class);
};

