var RubyClass = require('./class');

exports.BasicObject = null;
exports.Kernel = null;
exports.Object = null;
exports.Module = null;
exports.Class = null;
exports.Function = null;
exports.Method = null;
exports.UnboundMethod = null;

exports.getObjectName = function(obj) {
	return '#<' + RubyClass.getClassName(RubyClass.getClass(obj)) + '>';
};

exports.defineModule = function(name, fn) {
	var mod = new exports.Module(name, fn);

	global[name] = mod;

	return mod;
};

