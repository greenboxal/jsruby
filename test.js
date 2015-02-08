require('./lib');

var Foo = Class.create();

Foo.defineMethod('hello', function() {
	console.log('Hello');
});

var Bar = Class.create(Foo);

Bar.defineMethod('hello', function() {
	arguments.callee.super.call(this);
	
	console.log('World!');
});

