var util = require('./util');

Class.metaclass.create = function(constructor) {
	util.inheritPrototype(constructor, this);
	util.patchMetaclass(constructor, this, this.metaclass, constructor.name);

	this.inherited(constructor);

	return constructor;
};

Class.metaclass.inherited = function(klass) {
};

