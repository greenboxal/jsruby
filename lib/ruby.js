var RubyClass = require('./class');

exports.BasicObject = null;
exports.Kernel = null;
exports.Object = null;
exports.Module = null;
exports.Class = null;

exports.getObjectName = function(obj) {
	return '#<' + RubyClass.getClassName(RubyClass.getClass(obj)) + '>';
};

