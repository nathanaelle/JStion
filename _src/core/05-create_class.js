/**
 * create a class
 * 
 * @param  {function|object} constructor function or default value
 * @param  {object} prototype
 * 
 * @return {function}    constructor
 */
var create_class=function(constructor,prototype,inheritance){
	if(typeof constructor !== 'function')console.error('wrong parameter');

	var f=function(){
		constructor.apply(this,arguments);
		return this;
	};

	f.prototype = Object.create( inheritance===undefined ? Object.prototype: inheritance.prototype);

	for (var k in prototype)	f.prototype[k] = prototype[k];

	return f;
};

