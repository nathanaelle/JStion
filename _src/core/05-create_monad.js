/**
 * From Douglas Crockford ( Public Domain )
 * 
 * @param  {function} modifier [description]
 * 
 * @return {function}          [description]
 */
var create_monad=function(modifier){
	var prototype = Object.create(null);
	prototype.is_monad=true;

	var unit = function (value){
		var monad = Object.create(prototype);
		monad.bind = function(func,args){
			return func.apply( undefined, [ value ].concat(Array.prototype.slice.apply(args || [])) );
		};
		if(typeof modifier === 'function'){
			value=modifier(monad,value);
		}
		return monad;
	};

	unit.method = function (name, func) {
		prototype[name] = func;
		return unit;
	};
	unit.lift_value = function (name, func) {
		prototype[name] = function () {
			return this.bind(func, arguments);
		};
		return unit;
	};
	unit.lift = function (name, func) {
		prototype[name] = function () {
			var result = this.bind(func, arguments);
			return result && result.is_monad === true ? result : unit(result);
		};
		return unit;
	};
	return unit;
};


var maybe_empty = function(empty_bind){
	return create_monad(function(M,v){
		if(v.length >0 )	return v;
		M.bind = empty_bind;
		return [];
	});
};
