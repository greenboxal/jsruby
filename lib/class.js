var Ruby = require('./ruby');
var Reflect = require('harmony-reflect');
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

	exports.setFlags(metaclass, {
		singleton: true
	});

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

	while (superclass && exports.isIncludedClass(superclass)) {
		superclass = exports.getSuperclass(superclass);
	}

	exports.setSuperclass(metaclass, superclass ? ensureMetaclass(superclass) : Ruby.Class);

	return metaclass;
};

var makeSingletonClass = function(obj) {
	var origClass = exports.getClass(obj);
	var klass = exports.boot(origClass, 'Class:' + exports.getClassName(origClass) + ':' + fetchObjectId());

	exports.setFlags(klass, {
		singleton: true
	});

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

exports.setFlags = function(klass, flags) {
	var intern = klass.__iclass__;

	if (!intern) {
		throw new TypeError("not a jsruby class");
	}

	for (var key in flags) {
		intern[key] = !!flags[key];
	}
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

exports.getClassOrigin = function(klass) {
	var intern = klass.__iclass__;

	if (!intern) {
		throw new TypeError("not a jsruby class");
	}

	return intern.origin;
};

exports.setClassOrigin = function(klass, origin) {
	var intern = klass.__iclass__;

	if (!intern) {
		throw new TypeError("not a jsruby class");
	}

	intern.origin = origin;
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

exports.isModuleClass = function(klass) {
	var intern = klass.__iclass__;

	if (!intern) {
		throw new TypeError("not a jsruby class");
	}

	return !!intern.module;
};

exports.isSingletonClass = function(klass) {
	var intern = klass.__iclass__;

	if (!intern) {
		throw new TypeError("not a jsruby class");
	}

	return !!intern.singleton;
};

exports.isIncludedClass = function(klass) {
	var intern = klass.__iclass__;

	if (!intern) {
		throw new TypeError("not a jsruby class");
	}

	return !!intern.included;
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
	klass.prototype[name] = fn;
};

exports.undefineMethod = function(klass, name) {
	klass.prototype[name] = undefined;
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
	
	Object.defineProperty(intern, 'origin', {
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

exports.bootDefaultClass = function(name, superclass) {
	var obj = exports.boot(superclass, name);
	
	global[name] = obj;

	return obj;
};

exports.bootNativeClass = function(klass, name, superclass) {
	exports.classify(klass, Ruby.Class, superclass, name);

	return klass;
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

exports.createIncludeClass = function(module, superclass) {
	var klass = exports.alloc(Ruby.Class, "I:" + module.name);

	exports.setFlags(klass, {
		included: true
	});

	if (exports.isIncludedClass(module)) {
		module = exports.getClass(module);
	}

	exports.setSuperclass(klass, superclass);

	klass.prototype = new Proxy(klass.prototype, {
		get: function(target, name, receiver) {
			var desc = Object.getOwnPropertyDescriptor(module.prototype, name);

			if (desc) {
				if (desc.get) {
					return desc.get.call(receiver);
				} else {
					return desc.value;
				}
			}

			return target[name];
		}
	});
	
	if (exports.isIncludedClass(module)) {
		exports.setClass(klass, exports.getClass(module));
	} else {
		exports.setClass(klass, module);
	}

	return klass;
};

exports.includeModulesAt = function(klass, c, module) {
	var changed = 0;
	var klassPrototype = exports.getClassOrigin(klass).prototype;

	while (module) {
		var skip = false;
		var superclassSeen = false;

		if (exports.getClassOrigin(module) != module) {
			module = exports.getSuperclass(module);
			continue;
		}

		if (klassPrototype == module.prototype) {
			return -1;
		}

		for (var p = exports.getSuperclass(klass); p; p = exports.getSuperclass(p)) {
			if (exports.isIncludedClass(p)) {
				if (p.prototype == module.prototype) {
					if (!superclassSeen) {
						c = p;
					}

					skip = true;
				}
			} else {
				superclassSeen = true;
			}
		}

		if (skip) {
			module = exports.getSuperclass(module);
			continue;
		}

		var ci = exports.createIncludeClass(module, exports.getSuperclass(c));
		exports.setSuperclass(c, ci);
		c = ci;

		if (module.prototype && Object.keys(module.prototype).length > 0)
			changed = 1;

		module = exports.getSuperclass(module);
	}

	return changed;
};

exports.includeModule = function(klass, module) {
	var changed = 0;

	if (!(module instanceof Module)) {
		throw new TypeError("module should be a 'Module' instance");
	}

	changed = exports.includeModulesAt(klass, exports.getClassOrigin(klass), module);

	if (changed < 0)
		throw new Error("cyclic include detected");
};

exports.initHierarchy = function() {
	Ruby.BasicObject = exports.bootDefaultClass("BasicObject", null);
	Ruby.Object = exports.bootNativeClass(Object, "Object", Ruby.BasicObject);
	Ruby.Module = exports.bootDefaultClass("Module", Ruby.Object);
	Ruby.Class = exports.bootDefaultClass("Class", Ruby.Module);

	exports.setClass(Ruby.Class, Ruby.Class);
	exports.setClass(Ruby.Module, Ruby.Class);
	exports.setClass(Ruby.Object, Ruby.Class);
	exports.setClass(Ruby.BasicObject, Ruby.Class);
};

