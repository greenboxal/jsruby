var util = require('./util');

Class.prototype.create = function() {
	var object = this.allocate();

	if (object.respondTo('initialize')) {
		object.initialize.apply(object, arguments);
	}

	return object;
};

Class.prototype.allocate = function() {
	var metaclass = Object.create(this.prototype);

	Object.defineProperty(metaclass, 'metaclass', {
		enumerable: false,
		writable: false,
		readable: true,
		value: metaclass
	});

	return Object.create(metaclass);
};

Class.create = function(name, superclass) {
	var metaclass;

	if (!superclass) {
		superclass = Object;
	}

	if (!(superclass instanceof Class)) {
		throw new TypeError("superclass must be a Class.");
	}

	if (superclass === Object) {
		metaclass = Class.metaclass;
	} else {
		metaclass = superclass.metaclass;
	}

	var constructor = util.createNamedFunction(name, function() {
		constructor.create.apply(constructor, arguments);
	});

	util.inheritPrototype(constructor, superclass);
	util.patchMetaclass(constructor, superclass, metaclass, name);

	if (superclass.respondTo('inherited')) {
		superclass.inherited(constructor);
	}

	return constructor;
};

