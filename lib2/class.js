var util = require('./util');

var makeMetaclassForClass = function(klass) {

};

var makeSingletonClass = function() {

};

var makeMetaclass = function(obj) {
	if (obj instanceof Class) {
		return makeMetaclassForClass(obj);
	} else {
		return makeSingletonClass(obj);
	}
};

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

Class.metaclass.create = function(name, superclass) {
	if (!superclass) {
		superclass = Object;
	}

	if (!(superclass instanceof Class)) {
		throw new TypeError("superclass must be a Class.");
	}

	var constructor = util.createNamedFunction(name, function() {
		constructor.create.apply(constructor, arguments);
	});

	util.inheritPrototype(constructor, superclass);
	util.patchMetaclass(constructor, superclass, superclass.metaclass, name);

	if (superclass.respondTo('inherited')) {
		superclass.inherited(constructor);
	}

	return constructor;
};

