var util = require('./util');

Class.metaclass.create = function(superclass, constructor) {
	var metaclass;

	if (constructor === undefined) {
		constructor = superclass;
		superclass = Object;
	}

	if (!(superclass instanceof Class)) {
		throw new TypeError("superclass must be a Class.");
	}

	if (superclass === Object) {
		metaclass = Class;
	} else {
		metaclass = superclass.metaclass;
	}

	util.inheritPrototype(constructor, superclass);
	util.patchMetaclass(constructor, superclass, superclass.metaclass, constructor.name);

	if (superclass.respondTo('inherited')) {
		superclass.inherited(constructor);
	}

	return constructor;
};

