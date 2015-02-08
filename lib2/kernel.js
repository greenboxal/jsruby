var Kernel = Module.create();

Kernel.prototype.extend = function(/* ...modules */) {
	var modules = Array.prototype.slice.call(arguments);

	for (var i = 0; i < modules.length; i++) {
		if (!modules[i] instanceof Module) {
			throw new Error("Invalid type.");
		}
	}

	for (var i = modules.length - 1; i >= 0; i--) {
		var module = modules[i];

		module.extendObject(this);

		if (module.respondTo('extended')) {
			module.extended(this);
		}
	}
};

Kernel.prototype.send = function() {
	this.__send__.apply(this, arguments);
};

Kernel.prototype.respondTo = function(name) {
	return typeof this[name] === 'function';
};

global.Kernel = Kernel;
module.exports = Kernel;

