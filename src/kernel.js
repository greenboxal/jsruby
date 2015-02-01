var Kernel = Module.create();

Kernel.prototype.extend = function(/* ...modules */) {
	var target = this;
	var modules = Array.prototype.slice.call(arguments);

	if (this instanceof Class) {
		target = this.prototype;
	}

	for (var i = modules.length - 1; i >= 0; i--) {
		var module = modules[i];

		for (var key in module.prototype) {
			Object.defineProperty(target, key, {
				enumerable: false,
				value: module.prototype[key]
			});
		}

		module.__send__('extended', constructor);
	}
};

Kernel.prototype.send = function() {
	this.__send__.apply(this, arguments);
};

global.Kernel = Kernel;
module.exports = Kernel;

