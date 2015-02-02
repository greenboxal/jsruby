exports.copyAllProperties = function(source, dest, except) {
	var props = Object.getOwnPropertyNames(source);

	if (!except) {
		except = [];
	}

	except.push('__proto__');

	for (var i = 0; i < props.length; i++) {
		if (except.indexOf(props[i]) !== -1) {
			continue;
		}

		Object.defineProperty(dest, props[i], Object.getOwnPropertyDescriptor(source, props[i]));
	}
};

exports.deleteAllProperties = function(source, except) {
	var props = Object.getOwnPropertyNames(source);

	if (!except) {
		except = [];
	}

	except.push('__proto__');
	
	for (var i = 0; i < props.length; i++) {
		if (except.indexOf(props[i]) !== -1) {
			continue;
		}

		delete source[props[i]];
	}
};

exports.inheritPrototype = function(klass, superclass) {
	klass.prototype = Object.create(superclass.prototype || {}, {
		constructor: {
			enumerable: false,
			writable: false,
			readable: true,
			value: klass
		}
	});
};

exports.patchMetaclass = function(klass, superclass, parentMetaclass, name) {
	var metaclass = Object.create(parentMetaclass, {
		superclass: {
			enumerable: false,
			writable: false,
			readable: true,
			value: parentMetaclass
		},
		name: {
			enumerable: false,
			writable: false,
			readable: true,
			value: null
		}
	});

	Object.setPrototypeOf(klass, Object.create(metaclass, {
		superclass: {
			enumerable: false,
			writable: false,
			readable: true,
			value: superclass
		},
		name: {
			enumerable: false,
			writable: false,
			readable: true,
			value: name
		},
		metaclass: {
			enumerable: false,
			writable: false,
			readable: true,
			value: metaclass
		},
	}));
};

exports.getMetaclassOf = function(obj) {
	if (obj instanceof Class) {
		return obj.metaclass;
	} else {
		return obj.prototype;
	}
};

exports.includeModule = function(obj, module) {
	exports.copyAllProperties(module.prototype, obj);
};

exports.createNamedFunction = function(name, fn) {
	return (new Function("fn", "return function " + name + "() { return fn.apply(this, arguments); };"))(fn);
};

