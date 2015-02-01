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

Module.metaclass.appendFeatures = function(module) {
	for (var key in this.metaclass) {
		module.metaclass[key] = this.prototype[key];
	}
};

Module.metaclass.include = function(/* ...modules */) {
	var modules = Array.prototype.slice.call(arguments);
	
	for (var i = modules.length - 1; i >= 0; i--) {
		var module = modules[i];

		module.appendFeatures(this);

		if (module.metaclass.respondsTo('included')) {
			module.metaclass.send('included', constructor);
		}
	}
};

Module.metaclass.extended = function(klass) {
};

Module.metaclass.included = function(klass) {
};

Module.metaclass.toString = function() {
	return this.name;
};

