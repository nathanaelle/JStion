(function(window,undefined){


/**
 * [instanciable description]
 * @type {Object}
 */
var instanciable={};


/**
 * Handler for several kind of Storage
 * @type {Object}
 */
var StorageEngine={
	fake:(function(){
		var f=function(){ this.store={} };
		f.prototype={
			setItem:function(k,v){ this.store[k]=v},
			getItem:function(k){return this.store[k]},
			removeItem:function(k){delete this.store[k]},
			clear:function(){this.store={}},
		};
		return new f();
	})(),
	local:window.localStorage,
	session:window.sessionStorage,
};


var schema_op={
	recette_depense: {},
	debit_credit: {},
};
