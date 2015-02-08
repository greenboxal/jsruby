var Ruby = require('./ruby');
var RubyClass = require('./class');

exports.create = function() {
	return RubyClass.alloc(Ruby.Module);
};

