var util = require('./util');

Module.metaclass.create = function(name) {
	if (!name) {
		name = '';
	}

	var module = {};

	util.patchMetaclass(module, Module, Module.metaclass, name)

	module.prototype = {};

	return module;
};

Module.metaclass.call = Function.prototype.call;
Module.metaclass.apply = Function.prototype.apply;

Module.metaclass.extendObject = function(object) {
	util.includeModule(util.getMetaclassOf(object), this);
};

Module.metaclass.appendFeatures = function(object) {
	util.includeModule(object.prototype, this);
};

Module.metaclass.include = function(/* ...modules */) {
	var modules = Array.prototype.slice.call(arguments);

	for (var i = 0; i < modules.length; i++) {
		if (!modules[i] instanceof Module) {
			throw new Error("Invalid type.");
		}
	}

	for (var i = modules.length - 1; i >= 0; i--) {
		var module = modules[i];

		module.appendFeatures(this);
		module.included(this);
	}
};

Module.metaclass.extended = function(klass) {
};

Module.metaclass.included = function(klass) {
};

Module.metaclass.toString = function() {
	return this.name;
};

