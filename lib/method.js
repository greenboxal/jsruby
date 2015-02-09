var Ruby = require('./ruby');
var RubyClass = require('./class');
var RubyObject = require('./object');
var setFunctionName = require('function-name');

var createMethod = function(klass, name, fn, defs) {
	var method;

	if (defs.receiver) {
		method = fn.bind(defs.receiver);
		setFunctionName(method, name);
		delete method.prototype;
	} else {
		method = {};
	}

	RubyClass.setClass(method, klass);

	Object.defineProperty(method, '_info', {
		enumerable: false,
		readable: false,
		configurable: false,
		writable: false,
		value: {
			name: name,
			fn: fn,
			receiverClass: defs.receiverClass,
			receiver: defs.receiver,
			originalName: defs.originalName,
			klass: defs.klass
		}
	});

	return method;
};

var searchMethod = function(klass, name) {
	var fn;

	while (klass) {
		var desc = Object.getOwnPropertyDescriptor(klass.prototype, name);

		if (desc) {
			if (desc.get) {
				fn = desc.get;
			} else {
				fn = desc.value;
			}

			if (fn instanceof Function) {
				break;
			} else {
				fn = undefined;
			}
		}

		klass = RubyClass.getSuperclass(klass);
	}

	return { definedClass: klass, fn: fn };
};

// Method
var methodGetArity = function() {
	return this._info.fn.length;
};

var methodToString = function() {
	var klass = this._info.klass;
	var name = '#<' + RubyClass.getClassName(RubyClass.getClass(this)) + ': ';
	var sep = '#';

	if (RubyClass.isSingletonClass(klass)) {
		var attached = RubyClass.getAttachedSingletonClass(klass);

		if (this._info.receiver === undefined) {
			name += klass.toString();
		} else if (this._info.receiver == attached) {
			name += attached.toString();
			sep = '.';
		} else {
			name += this._info.receiver.toString();
			name += '(' + attached.toString() + ')'
			sep = '.';
		}
	} else {
		name += RubyClass.getClassName(this._info.receiverClass);

		if (klass != this._info.receiverClass) {
			name += '(' + RubyClass.getClassName(klass) + ')';
		}
	}

	name += sep + this.name;

	if (this._info.originalName != this._info.name) {
		name += '(' + this._info.originalName + ')';
	}

	name += '>';

	return name;
};

var methodToFunction = function() {
	return this._info.fn.bind(this._info.receiver);
};

var methodGetReceiver = function() {
	return this._info.receiver;
};

var methodGetName = function() {
	return this._info.name;
};

var methodGetOriginalName = function() {
	return this._info.originalName;
};

var methodGetOwner = function() {
	return this._info.definedClass;
};

var methodUnbind = function() {
	return createMethod(Ruby.UnboundMethod, this._info.name, this._info.fn, {
		klass: this._info.klass,
		originalName: this._info.originalName,
		receiverClass: this._info.receiverClass,
		receiver: undefined
	});
};

// UnboundMethod
var unboundMethodBind = function(receiver) {
	var methclass = this._info.receiverClass;

	if (!RubyClass.isModuleClass(methclass) && methclass != RubyClass.getClass(receiver) && !RubyObject.isKindOf(receiver, methclass)) {
		if (RubyClass.isSingletonClass(methclass)) {
			throw new TypeError("singleton method called for a different object");
		} else {
			throw new TypeError("bind argument must be an instance of " + RubyClass.getClassName(methclass));
		}
	}

	var rclass = RubyClass.getClass(receiver);

	if (RubyClass.isModuleClass(rclass)) {
		// TODO
	}

	return createMethod(Ruby.Method, this._info.name, this._info.fn, {
		klass: this._info.klass,
		originalName: this._info.originalName,
		receiverClass: rclass,
		receiver: receiver
	});
};

// Kernel
var kernelMethod = function(name) {
	return exports.create(RubyClass.getClass(this), this, name, Ruby.Method);
};

// Module
var moduleInstanceMethod = function(name) {
	return exports.create(this, undefined, name, Ruby.UnboundMethod);
};

exports.createFromFunction = function(fn, definedClass, klass, receiver, name, mclass) {
	var rclass = klass;

	if (!fn) {
		throw new Error("undefined method '" + name + "' for class '" + RubyClass.getClassName(klass) + "'");
	}

	klass = definedClass;

	while (rclass != klass && (RubyClass.isSingletonClass(rclass) || RubyClass.isIncludedClass(rclass)))
		rclass = RubyClass.getSuperclass(rclass);

	return createMethod(mclass, name, fn, {
		klass: klass,
		originalName: name,
		receiver: receiver,
		receiverClass: rclass
	});
};

exports.create = function(klass, receiver, name, mclass) {
	var res = searchMethod(klass, name);

	return exports.createFromFunction(res.fn, res.definedClass, klass, receiver, name, mclass);
};

exports.init = function() {
	Ruby.Function = RubyClass.bootNativeClass(Function, 'Function', Ruby.Object);

	Ruby.Method = Ruby.Class.create('Method');
	RubyClass.defineAllocFunction(Ruby.Method, null);
	RubyClass.undefineMethod(RubyClass.getClass(Ruby.Method), 'create');
	RubyClass.defineMethod(Ruby.Method, 'call', Function.prototype.call);
	RubyClass.defineMethod(Ruby.Method, 'apply', Function.prototype.apply);
	RubyClass.defineProperty(Ruby.Method, 'arity', methodGetArity);
	RubyClass.defineMethod(Ruby.Method, 'toFunction', methodToFunction);
	RubyClass.defineMethod(Ruby.Method, 'toString', methodToString);
	RubyClass.defineProperty(Ruby.Method, 'receiver', methodGetReceiver);
	RubyClass.defineProperty(Ruby.Method, 'name', methodGetName);
	RubyClass.defineProperty(Ruby.Method, 'originalName', methodGetOriginalName);
	RubyClass.defineProperty(Ruby.Method, 'owner', methodGetOwner);
	RubyClass.defineMethod(Ruby.Method, 'unbind', methodUnbind);

	Ruby.UnboundMethod = Ruby.Class.create('UnboundMethod');
	RubyClass.defineAllocFunction(Ruby.UnboundMethod, null);
	RubyClass.undefineMethod(RubyClass.getClass(Ruby.UnboundMethod), 'create');
	RubyClass.defineProperty(Ruby.UnboundMethod, 'arity', methodGetArity);
	RubyClass.defineMethod(Ruby.UnboundMethod, 'toFunction', methodToFunction);
	RubyClass.defineMethod(Ruby.UnboundMethod, 'toString', methodToString);
	RubyClass.defineProperty(Ruby.UnboundMethod, 'name', methodGetName);
	RubyClass.defineProperty(Ruby.UnboundMethod, 'originalName', methodGetOriginalName);
	RubyClass.defineProperty(Ruby.UnboundMethod, 'owner', methodGetOwner);
	RubyClass.defineMethod(Ruby.UnboundMethod, 'bind', unboundMethodBind);

	RubyClass.defineMethod(Ruby.Object, "method", kernelMethod);
	RubyClass.defineMethod(Ruby.Module, "instanceMethod", moduleInstanceMethod);
};

