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

exports.patchMetaclass = function(klass, superclass, metaclass, name) {
	var eigenclass = Object.create(metaclass, {
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
		}
	});

	Object.defineProperty(eigenclass, 'metaclass', {
		enumerable: false,
		writable: false,
		readable: true,
		value: eigenclass
	});

	Object.setPrototypeOf(klass, eigenclass);
};

