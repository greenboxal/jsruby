var util = require('./util');

Class.metaclass.create = function(constructor) {
	util.inheritPrototype(constructor, this);
	util.patchMetaclass(constructor, this, this.metaclass, constructor.name);

	if (this.metaclass.respondsTo('inherited')) {
		this.metaclass.send('inherited', constructor);
	}

	return constructor;
};

Class.metaclass.inherited = function(klass) {
};

