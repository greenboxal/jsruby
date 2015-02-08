var Reflect = require('harmony-reflect');

var MissingPropertyTrapTarget = Object.create(null);

module.exports = new Proxy(MissingPropertyTrapTarget, {
	get: function(target, name, receiver) {
		if (name == '__missingProperty__') {
			throw new Error("WTF");
		}

		return receiver.__missingProperty__(name);
	}
});

