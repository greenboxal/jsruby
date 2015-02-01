BasicObject.prototype.__send__ = function(/* method, ...args */) {
	var args = Array.prototype.slice.call(arguments);
	var method = args.shift();

	if (!this[method]) {
		throw new Error("undefined method '" + method + "' for " + this.constructor.name);
	}

	return this[method].apply(this, args);
};

BasicObject.prototype.instanceExec = function(/* method, ...args */) {
	var args = Array.prototype.slice.call(arguments);
	var method = args.shift();

	return method.apply(this, args);
};

BasicObject.prototype.instanceEval = function(src) {
	var fn;

	if (typeof src === 'string') {
		fn = new Function(src);
	} else if (typeof src === 'function') {
		fn = src;
	}

	return fn.apply(this);
};


