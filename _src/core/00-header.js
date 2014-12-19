(function(window,undefined){
"use strict";

/**
 * [instanciable description]
 * @type {Object}
 */
var instanciable={};

var pcg={};

/**
 * Handler for several kind of Storage
 * @type {Object}
 */
var StorageEngine={
	fake:(function(){
		var F=function(){
			this.store={};
		};
		F.prototype={
			setItem:	function(k,v){
				this.store[k]=v;
			},
			getItem:	function(k){
				return this.store[k];
			},
			removeItem:	function(k){
				delete this.store[k];
			},
			clear:function(){
				this.store={};
			},
		};
		return new F();
	})(),
	local:window.localStorage,
	session:window.sessionStorage,
};


var schema_op={
	recette_depense: {},
	debit_credit: {},
};
