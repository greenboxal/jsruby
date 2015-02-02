var util = require('./util');

Module.metaclass.create = function(name) {
	if (!name) {
		name = '';
	}

	var module = {};

	util.patchMetaclass(module, undefined, Module.metaclass, name)

	module.prototype = {};

	return module;
};

Module.prototype.call = Function.prototype.call;
Module.prototype.apply = Function.prototype.apply;

Module.prototype.extendObject = function(object) {
	util.includeModule(util.getMetaclassOf(object), this);
};

Module.prototype.appendFeatures = function(object) {
	util.includeModule(object.prototype, this);
};

Module.prototype.include = function(/* ...modules */) {
	var modules = Array.prototype.slice.call(arguments);

	for (var i = 0; i < modules.length; i++) {
		if (!modules[i] instanceof Module) {
			throw new Error("Invalid type.");
		}
	}

	for (var i = modules.length - 1; i >= 0; i--) {
		var module = modules[i];

		module.appendFeatures(this);

		if (module.respondTo('included')) {
			module.included(this);
		}
	}
};

Module.prototype.extended = function(klass) {
};

Module.prototype.included = function(klass) {
};

Module.prototype.toString = function() {
	return this.name;
};

