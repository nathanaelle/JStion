/*! JStion — 2.0.0 2014-12-19 */
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
function to_array(arg){
	return [].slice.call( arg || [] );
}

function copy_array(arr){
	return arr.slice();
}

function idem(e){
	return e;
}

function filter_and_dispatch( filter, exact ) {
	return function (set){
		return set.filter( filter ).reduce(function(resp,e){
			if(exact(e))	return {
				exact:	resp.exact.concat([e]),
				sub:	resp.sub
			};
			return {
				exact:	resp.exact,
				sub:	resp.sub.concat([e])
			};
		}, { exact:[], sub:[] } );
	};
}
/**
 * create a class
 *
 * @param  {function|object} constructor function or default value
 * @param  {object} prototype
 *
 * @return {function}    constructor
 */
var create_class=function(constructor,prototype,inheritance){
	if(typeof constructor !== 'function')	console.error('wrong parameter');

	var f=function(){
		constructor.apply(this,arguments);
		return this;
	};

	f.prototype = Object.create( inheritance===undefined ? Object.prototype: inheritance.prototype);

	if(prototype instanceof Function) prototype=prototype(f);

	for(var k in prototype)	f.prototype[k] = prototype[k];

	return f;
};
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
/**
 * Accounting Large Object
 *
 */
var ALO=create_class(
	function(){

	},
	{
		/**
		 * Load On Demand data
		 *
		 * @param  {string} o [description]
		 * @param  {string} k [description]
		 *
		 * @return {object}   [description]
		 */
		lod:function(k){
			// load on demand
			var id = this.hasOwnProperty(k)? this[k] : k;

			if( id === undefined	) return undefined;
			if( id === false	) return undefined;

			if(id.split === undefined ){
				return new this.$.Comptes( id, this.$ );
			}

			return this.$.sync('read',{
				id:	id,
				$:	this.$
			});
		},


		/**
		 * generate an ID for an object
		 *
		 * @return {string} ID of the object
		 */
		sign:function(){
			this.id= ''+CryptoJS.SHA1( JSON.stringify(this) );
			return this.id;
		},


		/**
		 * Initialize an object with given s non undefined values or d values
		 *
		 * @param {object} s [description]
		 * @param {object} d [description]
		 */
		set_or_default:function(s,d){
			for( var i in d ){
				this[i]= ( s[i]===undefined ? d[i] : s[i] );
			}
			return this;
		},


		/**
		 * Save an object ... and attribut it an ID
		 */
		save:function(o){
			return this.$.sync('update',this,o);
		}
	});
var Blob=create_class(
	function(o){
		this.set_or_default(o,{
			data:	'',
			meta:	{},
			livre:	undefined,
			id:	undefined,
			$:	undefined,
		});

		this.meta	= new Hash( this.meta );

		if(this.id === undefined)	this.save();
	},{

		toJSON:function(){
			return {
				data:	this.data
			};
		},

		toVSON:function(){
			return this.data;
		}

	}, ALO );
/**
 * Hash Class
 * @type {Object}
 */
var Hash = create_class(
	function(o){
		if(!o)	return;
		Object.keys(o).forEach(function(k){
			this[k] = o[k];
		}.bind(this));
	},{
		concat:function(o){
			var r = new Hash(this);

			Object.keys(o).forEach(function(k){
				if(r.hasOwnProperty(k))	r[k] += "\n" + o[k];
				else			r[k] = o[k];
			});

			return r;
		},

	},Object);

var	MultiPart=function (part, precision, validate, negate,compare,quotient){
	var factor=Math.pow(10,precision);

	var MP = create_class(
			function (e){
				var asis = function(e){
					[].push.apply(this, e);
					return;
				}.bind(this);

				var inject = function(e){
					[].push.apply( this, e.map(function (i){
						return Math.round(i*factor);
					}) );
					return;
				}.bind(this);

				if(e === undefined)	return asis(Array.apply(null, new Array(part)).map(Number.prototype.valueOf,0));

				if(e instanceof MP)	return asis(e);

				if(e instanceof Array && e.length === part){
					if(e[0] === Number(e[0]))	return	asis(e);
					else				return	inject(e.map(Number));
				}

				var args = to_array( arguments );

				if(e === Number(e) && args.length === part)	return inject(args);

				throw ("don't know how to handle ["+JSON.stringify(e)+"]");
			},{
				// return true if the reduction is in Equilibrum, aka equivalent to zero
				inEquilibrium: function (){
					return this.toFixed().replace(/0|\./g, '') === '';
				},

				// use the validate unary operator to transform the multipart number to a number in |R
				reduction: function (){
					return (validate.apply(null, to_array(this))/factor);
				},

				// binary operator that add two MP number
				add:	function (o){
					if(!(o instanceof MP))	return this.add( new MP(o) );

					return new MP(this.map(function (Ci,i){
						return Ci+o[i];
					}));
				},

				// binary scalar operator that scale a MP number
				scale:	function (f){
					return new MP(this.map(function (Ci){
						return Math.round(Ci*f);
					}));
				},

				// binary operator that mask part of a MP number
				mask:	function(unit){
					return new MP( [].map.call(this, function(e,i,a){
						return unit[i]*e;
					}));
				},

				// unary operator that negate a MP number
				negate:	function (){
					return new MP(negate.apply(null, to_array(this) ));
				},

				// binary operator that compare two MP numbers
				compare:function (b){
					return compare.apply(null, [this,b].map(to_array) );
				},

				// unary operator that transform a MP to its smallest form
				quotient:function (){
					return new MP(quotient.apply(null, to_array(this) ));
				},

				toFixed: function (){
					return this.reduction().toFixed(precision);
				},

				toJSON: function (){
					return this.map(function (Ci){
						return (Ci/factor).toFixed(precision);
					});
				},

				// return the "zero" of a MP number set
				zero:	function (){
					return new MP( Array.apply(null, new Array(part)).map(Number.prototype.valueOf,0) );
				},

				// return the "units" of a MP number set
				unit:	function (){
					var tojson	= function () {
						return copy_array(this);
					};
					var scale	= function (f) {
						return new MP(this.map(function (Ci){
							return Math.round(Ci*f*factor);
						}));
					};

					// @todo TODO there is some trouble in the force : $fi.op('param') is unknown without JStion.Exts
					var ope		= function(e){
						return $fi.Operation( $fi.want(  $fi.op('param')(e,this, '')  ) );
					};
					var v		= Array.apply(null, new Array(part)).map(Number.prototype.valueOf,0);

					return copy_array(v).map(function (U,i) {
						return copy_array(v);
					}).map(function (U,i) {
						U[i]=1;
						var z=new MP( U );
						z.toJSON=tojson;
						z.scale=scale;
						z.ope = ope;
						return z;
					});
				},
			},Array);

	MP.UNITS = MP.prototype.unit();
	MP.ZERO  = MP.prototype.zero();

	return MP;
};
/**
 * [$fi description]
 *
 * @param  {[type]} o [description]
 *
 * @return {[type]}   [description]
 */
var $fi = create_class(
	function (o){
		o=o||{};
		o.storage=o.storage||'';

		this.storage= StorageEngine[( o.storage in StorageEngine && o.storage )||'fake'];

		//if( Backbone !== undefined && Backbone.sync !== $fi.fn.sync ) Backbone.sync = $fi.fn.sync;

		var id = this.storage.getItem( 'JStion_HEAD' );

		if(!id)	return this._set_default(o);

		this._set_default( (JSON.parse( this.storage.getItem( id ) ) ).data || o );
		this.save();
	},{

		toJSON: function (){
			return {
				parent:		this.parent,
				e:		this.e,
				entities:	this.entities
			};
		},

		_set_default:function (o){
			this.set_or_default(o,{
				e:{
					parent:		undefined,
					operateurs:	{},
					mouvements:	{},
					operations:	{},
				},
				entities:{

				},
				id:	undefined
			});
		},

		shortify: function (l){
			return l.map(function (i){
				return i.id.substr(i.id.indexOf(':')+1,7);
			}).join(' ');
		},

		want: function (f){
			return new this.promise(f);
		},

		save: function (f){
			var ret = null;
			if( f instanceof Function ) ret = f.call(this);

			this.parent = this.id;
			this.sync('update',this);
			this.storage.setItem( 'JStion_HEAD', this.id );

			return ret;
		},

		register_class: function ( name , classe , options ){
			options = options||{};
			options.instanciable = !!options.instanciable;

			this[name]=classe;

			if(options.instanciable) {
				instanciable[name] = classe;
			}

		},

		register_plan: function (fullpath,shortname,plan){
			pcg[fullpath]	= plan;
			pcg[shortname]	= plan;

		},

	},ALO);

$fi.fn = $fi.prototype;
/**
 *	Debit Credit
 */
$fi.fn.DC	=new MultiPart( 2, 3,
	function (debit,credit){
		return debit-credit;
	},
	function (debit,credit){
		return [ credit, debit ];
	},
	function (a,b){
		if( a[0] > b[0]	) return -1;
		if( b[0] > a[0]	) return 1;
		if( a[0] > 0	) return 0;
		if( a[1] > b[1]	) return 1;
		if( b[1] > a[1]	) return -1;
		return 0;

	},
	function (debit,credit){
		return [ debit-credit, credit-debit ].map(function(i){
			return i>0?i:0;
		});
	}
	);

$fi.fn.DC.U_Debit	=$fi.fn.DC.UNITS[0];
$fi.fn.DC.U_Credit	=$fi.fn.DC.UNITS[1];

$fi.fn.DC_P2	=new MultiPart( 2, 2,
	function (debit,credit){
		return debit-credit;
	},
	function (debit,credit){
		return [ credit, debit ];
	},
	function (a,b){
		if( a[0] > b[0]	) return -1;
		if( b[0] > a[0]	) return 1;
		if( a[0] > 0	) return 0;
		if( a[1] > b[1]	) return 1;
		if( b[1] > a[1]	) return -1;
		return 0;

	},
	function (debit,credit){
		return [ debit-credit, credit-debit ].map(function(i){
			return i>0?i:0;
		});
	}
	);

$fi.fn.DC_P2.U_Debit	=$fi.fn.DC_P2.UNITS[0];
$fi.fn.DC_P2.U_Credit	=$fi.fn.DC_P2.UNITS[1];
$fi.fn.aggregate = function(){
	var args = to_array( arguments );

	if(typeof args[0] === 'string'){
		var message = args.shift();

		return function(societe){
			var part = new $fi.fn.Fragment();

			args.forEach(function(c){
				if(typeof c === 'function' ) part = part.add( c(societe) );
			else if(typeof c === 'object' && c instanceof $fi.Fragment() ) part = part.add( c );
				else if(c>0){
					part = part.add(societe.r_etat(""+c).solde());
				}else if(c<0){
					part = part.sub(societe.r_etat(""+(-c)).solde());
				}
			});

			return part.simplify(message);
		};
	}

	return function(societe){
		var part = new $fi.fn.Fragment();

		args.forEach(function(c){
			if(typeof c === 'function' ) part = part.add( c(societe) );
			else if(typeof c === 'object' && c instanceof $fi.Fragment() ) part = part.add( c );
			else if(c>0){
				part = part.add(societe.r_etat(""+c).solde());
			}else if(c<0){
				part = part.sub(societe.r_etat(""+(-c)).solde());
			}
		});

		return part;
	};
};

$fi.fn.ag_mask=function(){
	var args = to_array( arguments );
	var mask = args.slice(0,1).pop();
	args = args.slice(1);

	return function(societe){
		var part = new $fi.fn.Fragment();

		args.forEach(function(c){
			if(typeof c === 'function' ) part = part.add( c(societe).mask(mask) );
			else if(typeof c === 'object' && c instanceof $fi.Fragment() ) part = part.add( c.mask(mask) );
			else if(c>0){
				part = part.add(societe.r_etat(""+c).solde().mask(mask));
			}else if(c<0){
				part = part.sub(societe.r_etat(""+(-c)).solde().mask(mask));
			}
		});

		return part;
	};
};
$fi.fn.promise=create_class(
	function(f){
		this.f	= f;
	},
	{
		constrain:function(v){
			return v;
		},

		resolve:function(x) {
			var prom = this;
			var f = (prom.f)(prom.constrain(x));
			if(f instanceof Function) return f;
			return function(v){
				return (prom.f)(prom.constrain(x));
			};
		},

		toJSON: function(){
			return [ 'want', this.f ];
		}
	} );
$fi.fn.sync = function(method,model,options){
	var r;
	var getclass='';

	options=options||{};
	options.success=options.success||function(){};

	switch (method) {
		case "read":
			if( model.id === undefined )	return undefined;
			if( !model.id ){
				console.log(model);
				console.error('no id in model for method '+method);
				throw new Exception('no id in model for method '+method);
			}

			r =this.storage.getItem(model.id);
			if(r === undefined ) return undefined;

			r		= JSON.parse( r );
			r.type		= this[r.type];
			r.data.id	= model.id;
			r.data.$	= this;
			r		= new r.type( r.data );
			break;

		case "create":
		case "update":
			getclass = Object.keys(instanciable).filter(function(k){
				return	(model instanceof this[k]);
			}.bind(this) );

			this.storage.setItem( model.sign(), JSON.stringify( {
				type:	getclass,
				data:	model
			} ));
			r= model;
			break;

		case "delete":
			this.storage.removeItem( model.sign() );
			r= {};
	}

	options.success(r);

	return r;
};
$fi.fn.op = function(name){
	return this.e.operateurs[name] || function(){
		console.log('operateur '+ c +' indefini');
	};
};


/**
 * create an account operator
 *
 * @param  {String} name name of the operator
 * @param  {Function} ope  code of the operator
 *
 * @return {Function}      [description]
 */
$fi.fn.create_operateur = function(name,ope){
	this.e.operateurs[name]=function(account,CNumber,help){
		var f = function(x){
			var y = ope.apply(CNumber, [x] );

			if( y instanceof Function ) {
				var z = function(x){
					return [ [account].concat( y.apply(CNumber,[x]) ) ];
				};

				z.toJSON	= function(){
					return [ [ name, account, CNumber.toJSON(), help ], x ];
				};

				return z;
			}

			return [ [account].concat( y ) ];
		};

		f.help= function(){
			return (typeof help === 'string')?help:'';
		};

		f.toJSON= function(){
			return [ name, account, CNumber.toJSON(), help ];
		};

		return f;
	};

	this.save();

	return this;
};
/**
 * Fragment d'écriture ou de compte
 *
 *
 */
$fi.fn.Fragment=create_class(
	function (e){
		var asis = function(e){
			[].push.apply(this, e);
			return;
		}.bind(this);

		this.single=false;

		if(e === undefined)	return asis([]);

		if(e instanceof $fi.fn.Fragment)	{
			this.single = e.single;
			return asis(to_array(e));
		}

		if(e instanceof Array)	return asis(e);


		console.log(e);
		throw ("don't know how to handle ["+JSON.stringify(e)+"]");

	},function(Prototype){
		return {
			maybe_empty: maybe_empty(function () {
				return new Prototype([]);
			}),

			toJSON:function (){
				return [].map.call(this, idem );
			},

			toVSON:function (){
				if(this.single){
					return [].map.call(this,function (f){
						if(f instanceof Array)	return [ f[0], f[1].toFixed() ];
						return f;
					});
				}

				return [].map.call(this,function (f){
					if(f instanceof Array)	return [ f[0], f[1].toJSON() ];
					return f;
				});
			},

			add:function (f){
				if(f === undefined) return this;

				return new Prototype( to_array(this).concat( to_array(f) ) );
			},

			sub:function (f){
				return this.add(f.negate());
			},

			simplify:function (t){
				if(this.length===0)	return this;
				return this.reduce(function (res,e){
					return [ res[0], res[1].add(e[1]) ];
				},[t, this[0][1].zero() ] );
			},

			negate:function (){
				return this.map(function (f){
					return [ f[0], f[1].negate() ];
				});
			},

			solde:function (){
				return this.map(function (s){
					return [s[0], s[1].quotient() ];
				});
			},

			map: function (func){
				return new Prototype([].map.call(this,func));
			},

			reduce: function (func,zero){
				return new Prototype([ [].reduce.call(this,func,zero) ]);
			},

			mask:function (unit){
				return this.map(function (s){
					return [s[0], s[1].mask(unit) ];
				});
			},

			single_col:function (b){
				this.single=!!b;
				return this;
			}
		};
	}, Array );
$fi.fn.Operation=(function (){

	var reduct_signed = function (x){
		return x.map(function (e){
			return e[1]-e[2];
		}).reduce(function (a,b){
			return a+b;
		},0);
	};

	var reduct_unsigned = function (x){
		return Math.abs(x.map(function (e){
			return e[1]-e[2];
		}).reduce(function (a,b){
			return a+b;
		},0));
	};

	var reduct = function (x){
		if(x.length === 0)	return 0;
		return Math.abs(x.reduce(function (old,v){ return old.add(v[1]); }, x[0][1].zero() ).reduction());
	};

	var equilibre = function (x){
		if(x.length === 0)	return true;
		return Math.abs(x.reduce(function (old,v){ return old.add(v[1]); }, x[0][1].zero() ).inEquilibrium());
	};


	var operations = create_monad()

		.lift_value('o',function (mouvement,f){
			if( f === undefined )		return compose_operation( mouvement );
			if( f.bind === undefined )	return compose_operation( mouvement );

			return compose_operation( mouvement.concat( f.bind( function (mouvement){
				return mouvement;
			} )));
		})

		.lift_value('grab',function (mouvement, vars){
			var t = mouvement
				.filter(function (e){
					return e instanceof $fi.fn.promise;
				}).slice(vars.length);

			if(t.length === 0 ) return vars;

			return vars.concat(
				t
				.map(function (n){
					return Number(prompt(n.f.help));
				}));
		})

		.lift_value('toJSON', function (mouvement) {
			return mouvement.slice(0);
		})

		.lift_value('compose',function (mouvement,vars) {
			return mouvement.reduce(function (e1,e2){
			//	console.log([ 'compose', reduct(e1), e1, e2, vars ].map(JSON.stringify));

				if(e2 instanceof $fi.fn.promise){
					var arg = vars.shift();
					if( arg instanceof Function ) arg = reduct(arg( e1 ));
					e2 = e2.resolve(arg);
				}

				return e2(reduct(e1)).concat(e1);
			}, [] );
		})


		.method('resolve', function (){
			var args = to_array( arguments );
			var meta = args.shift();

			var e = {
				meta:		meta,
				mouvement:	this.compose( this.grab( args ))
			};

			if(!equilibre(e.mouvement)) {
				console.log('non équilibré : '+ reduct(e.mouvement) );
				console.log(e);
				throw new Exception('Ecriture non équilibrée');
			}

			return new $fi.fn.Ecriture(e);
		});


	var compose_operation = function ( mouvement ){
		var op = operations( mouvement );

		var r = op.resolve.bind( op );

		r.o = op.o.bind( op );
		r.bind = op.bind.bind( op );
		r.toJSON= op.toJSON.bind( op );

		return r;
	};

	return function (){
		return compose_operation( to_array( arguments ) );
	};
})();



$fi.fn.peek_last = function (e){
//	console.log(JSON.stringify(e) );
	return [e[0]];
};
/**
 * [Ecriture description]
 */
$fi.fn.Ecriture=create_class(
	function (m){
		this.set_or_default(m,{
			mouvement:	[],
			meta:		{ message: '' },
			id:		undefined,
		});

		this.meta	= new Hash( this.meta );

		this.mouvement = this.mouvement.sort(function (a,b){
			var c =a[1].compare(b[1]);
			if(c!==0) return c;
			if(a[1].compare(a[1].zero() ) < 0) return (a[0]-b[0])/Math.abs(a[0]-b[0]);
			return (b[0]-a[0])/Math.abs(b[0]-a[0]);
		} );
	},{

		toVSON:function (){
			return {
				meta:		this.meta,
				mouvement:	this.mouvement.map(function(e){
					return [ e[0], e[1].toJSON() ];
				})
			};
		},

		o:function (e){
			return new $fi.fn.Ecriture({
				mouvement:	this.mouvement.concat(e.mouvement),
				meta:		this.meta.concat( e.meta )
			});
		}

	}, ALO );
/**
 * Compte Comptable
 *
 * Décrit un Compte au sens de la comptabilité générale
 *
 */
$fi.fn.Compte=create_class(
	function(o){
		this.set_or_default(o,{
			journal:	undefined,
			account:	undefined,
			nom:		'',
			subaccounts:	undefined,
			id:		undefined,
			$:		undefined,
		});

		if(o.finit !== undefined && o.finit instanceof Object ){
			this.subaccounts = (new this.$.Comptes( [], this.$ )).first_root_init( o.finit );
			this.journal = (new this.$.Journal({
				$:	this.$
			})).id;
		}

		if(this.id === undefined)	this.save();
	},{

		sigma:function (Type){
			return this.lod('journal').cast(Type).reduce(function(a,b){
				return a.add(b);
			}, Type.ZERO );
		},

		sub_sigma:function (Type){
			return this.lod('subaccounts').sub_sigma(Type);
		},

		is_parent_of: function	(account){
			return account.indexOf(this.account) === 0;
		},

		eq: function	(account){
			return account === this.account;
		},

		fragment: function (func){
			return new (this.$.Fragment)([ [ this.account, func(this) ] ]);
		},

		find_and_map:function(targeted_accs, func ){
			var o		= this;
			var maybe_empty	= this.$.Fragment.prototype.maybe_empty;

			// do I know any targeted account ?
			var extract = filter_and_dispatch( this.is_parent_of.bind(this), this.eq.bind(this) )(targeted_accs);

			// make a list of fragment for this account and its sub account
			return	maybe_empty( extract.exact )
				.bind(function(){
					return o.fragment(func);
				})
				.add(
					maybe_empty( extract.sub )
					.bind(function(v){
						return o.lod('subaccounts').find_any( v, func );
					})
				);
		},

		diff:function(old){
			if( this.id === old.id) return [];
			var diff = [];
			if(this.account !== old.account )		throw new Exception('Y u duno compare different accounts ?');

			if(this.journal !== old.journal ){
				diff = this.lod('journal').diff( old.lod( 'journal') ).map(function(e){
					return [ this.account, e ];
				}, this);
			}

			if( this.subaccounts.join(' ') === old.subaccounts.join(' '))	return diff;

			return diff.concat( this.lod('subaccounts').diff( old.lod( 'subaccounts') ) );
		},

		toJSON:function(){
			return {
				account:	this.account,
				nom:		this.nom,
				subaccounts:	this.subaccounts,
				journal:	this.journal
			};
		},

		toVSON:function(Type){
			var s=this.sigma(Type);
			return {
				account:	this.account,
				nom:		this.nom,
				subaccounts:	this.lod('subaccounts').toVSON(Type),
				data:		s.toJSON(),
				solde:		s.quotient().toJSON(),
			};
		},

		mouvement:function(m){
			var subaccounts;

			m = filter_and_dispatch(
				function(e){
					return this.is_parent_of(e[0]);
				}.bind(this),
				function(e){
					return this.eq(e[0]);
				}.bind(this)
			)( m );

			function values(e){
				return e[1];
			}

			// is it my problem ?
			if(m.exact.length===0 && m.sub.length===0)	return false;

			var e_m = m.exact.map( values );

			var s_m = m.sub;

			// may it my subaccounts problem ?
			if( s_m.length>0 ){
				subaccounts = this.lod('subaccounts').mouvement({ mouvement: s_m });
				if(!subaccounts)	e_m = e_m.concat( s_m.map( values ));
			}

			return new this.$.Compte({
				journal:	this.lod('journal').append( e_m ).id,
				account:	this.account,
				nom:		this.nom,
				subaccounts:	(subaccounts || this.subaccounts ),
				$:		this.$,
			});
		},

	}, ALO );
/**
 * Journal des mouvements
 *
 * Comptient la liste ordonnée de chaque mouvement sur un Compte
 */
$fi.fn.Journal=create_class(
	function (o){
		this.set_or_default(o,{
			data:	[],
			id:	undefined,
			$:	undefined,
		});

		if(this.id === undefined)	this.save();
	},{
		toJSON:	function (){
			return {
				data: this.data.slice(0),
			};
		},

		append:	function (o){
			if(o.length===0)	return this;

			return new this.$.Journal({
				data:	this.data.concat(o),
				$:	this.$,
			});
		},

		diff:	function (old){
			return	this.data.slice(old.data.length);
		},

		cast:	function (Type){
			return this.data.map(function(e){
				return new Type(e);
			});
		},

	}, ALO );
/*
 * Sous ensemble de Comptes
 *
 * Décrit une liste de comptes
 *
 */
$fi.fn.Comptes= create_class(
	function(e,$){
		[].push.apply( this, e );
		this.$ = $;
	},function(Prototype){
		return {

			lod:function(id){
				return this.$.sync('read',{
					id:	id,
					$:	this.$
				});
			},

			first_root_init:function(plan){
				for(var i in plan) switch(i){
					case 'compte':
					case 'mode':
					case 'title':break;
					default:
						var o = plan[''+i];
						this.push( (new this.$.Compte({
							account:	o.compte,
							nom:		o.title,
							finit:		o,
							$:		this.$
						})).id );
				}

				return this.toJSON();
			},

			sub_sigma: function(Type){
				return this.map(function(c){
						return c.sigma(Type).add( c.sub_sigma(Type) );
					}.bind(this))
				.reduce(function(a,b){
					return a.add(b);
				}, Type.ZERO );
			},

			map: function (func){
				return [].map.call(this,function(e){
					return this.lod(e);
				}.bind(this)).map(func);
			},

			reduce: function (func,zero){
				return [].map.call(this,function(e){
					return this.lod(e);
				}.bind(this)).reduce(func,zero);
			},


			filter: function (func){
				return [].map.call(this,function(e){
					return this.lod(e);
				}.bind(this)).filter(func);
			},

			find_any:	function(targeted_accs, func){
				var $=this.$;
				var c_set=this;

				return this.map(function(c){
					return [ c, targeted_accs.filter(function(a){
						return a.indexOf(c.account) ===0;
					}) ];
				}).filter(function(sc){
					return sc[1].length>0;
				}).map(function(sc){
					//console.log(sc);
					return sc[0].find_and_map( sc[1], func );
				}).reduce(function(a,b){
					return a.add(b);
				}, new $fi.fn.Fragment([]) );
			},


			mouvement:	function(m){
				var $=this.$;
				var c_set=this;

				var sub_c = this.map(function(c){
					return [c.account, c];
				});

				m=m.mouvement.map(function(e){
					return [ e, sub_c.filter(function(c){
							return e[0].indexOf(c[0]) ===0;
						})
					];
				}).filter(function(e_c){
					return e_c[1].length ===1;
				});

				if(m.length===0) return false;

				var sub_m = {};
				m.forEach(function(e_c){
					var k = e_c[1][0][0];
					if(sub_m[k]===undefined) sub_m[k]={
						account:	e_c[1][0][1],
						mouvement:	[ e_c[0] ]
					};
					else sub_m[k].mouvement.push( e_c[0] );
				});

				for( var i in sub_m) {
					sub_m[i] = sub_m[i].account.mouvement( sub_m[i].mouvement );
				}

				var r = sub_c.map( function(c){
					return (sub_m[c[0]]===undefined) ? c[1].id : sub_m[c[0]].id ;
				});

				return new this.$.Comptes( r, this.$ );
			},

			diff:function(old){
				if( this.length !== old.length ) throw new Exception('y u duno comparing different arrays ?');

				var c_set = this;

				return this.map(function(c,pos){
					return c.diff( old.lod( old[pos] ) );
				}).reduce(function(a,b){
					return a.concat(b);
				},[]);
			},

			toJSON:function(){
				return copy_array(this);
			},

			toVSON:function(Type){
				return this.map(function(c){
					return c.toVSON(Type);
				});
			},

			save:function(){
				this.$.sync('update',this,{
					success:function(){}
				});
			},
		};
	}, Array);
/**
 * Entite comptable
 *
 * Decrit une entité comptable tel qu'une entreprise, une société, une association, ...
 */
$fi.fn.Entite= create_class(
	function (o){
		this.set_or_default(o,{
			parents:	undefined,
			nom:		'acme',
			livre:		undefined,
			mode:		'abrege',
			fiche:		{},
			tags:		{},
			id:		undefined,
			type:		'DC',
			$:		undefined,
		});

		this.tags	= new Hash( this.tags );
		this.fiche	= new Hash( this.fiche );

		if( this.livre === undefined ){
			this.livre=( new this.$.Livre({
				mode:	this.mode,
				type:	this.type,
				$:	this.$
			}) ).id;
		}

		if(!this.id){
			this.save();
			this.$.update_ent( this );
		}
	},{
		toJSON:function (){
			return {
				parents:	this.parents,
				nom:		this.nom,
				mode:		this.mode,
				fiche:		this.fiche,
				livre:		this.livre,
				type:		this.type,
				tags:		this.tags
			};
		},

		toVSON:function (){
			var r =this.toJSON();
			r.livre=this.lod('livre').toVSON();
			r.meta=this.log().meta;
			return r;
		},

		tag:function (tag){
			return this.lod( this.tags[tag] );
		},

		set_tag:function (tag,livre_ref)	{
			var t = {};
			t[tag] = livre_ref || this.livre;

			return new $fi.fn.Entite({
				parents:		[ this.id ],
				nom:			this.nom,
				livre:			this.livre,
				mode:			this.mode,
				fiche:			this.fiche,
				tags:			this.tag.concat( t ),
				type:			this.type,
				$:			this.$,
			});
		},

		commit:function (e){
			return new $fi.fn.Entite({
				parents:		[ this.id ],
				nom:			this.nom,
				livre:			this.lod('livre').commit(e).id,
				mode:			this.mode,
				fiche:			this.fiche,
				tags:			this.tags,
				type:			this.type,
				$:			this.$,
			});
		},

		log:	function (){
			return this.lod('livre').log();
		},

		checkout:	 function	(id){
			var r = this.lod(id ||this.livre);
			return (r instanceof this.$.Livre)?r:undefined;
		},

		history:function (){
			return this.lod('livre').history();
		},

		back:	function (i){
			if(i===0) return this;
			if(this.parents === undefined) return this;
			// @bug BUG only handle linear case
			return this.lod( this.parents[0] ).back(i-1);
		},

		diff:	function (id){
			if(! (id instanceof this.$.Livre )){
				if(id instanceof String) id=this.lod(id);
				if(id instanceof this.$.Entite) id=this.lod(id.livre);
			}

			if(id instanceof this.$.Livre)	return this.lod('livre').diff(id);

			throw new TypeError('id must be an Livre or Entity');
		},

	}, ALO );

$fi.fn.update_ent= function (o){
	this.save(function (){
		this.entities[o.nom] = o.id;
	});
};

$fi.fn.entity	= function (name,options){
	options=options||{};
	options.mode=options.mode||'abrege';

	this.entities[name] = this.entities[name] || {};

	if(!!this.entities[name])	return this.sync('read', { id: this.entities[name] });

	return this.save(function (){
		console.log( this.set_or_default.call({ nom: name, $:this }, {},options ) );
		var ent = new this.Entite({ nom: name, $:this });

		this.entities[name] = ent.id;
		return ent;
	});
};
/**
 * Livre Comptable
 *
 * Décrit l'état du Livre Comptable contenant toutes les écritures à un instant donné.
 */
$fi.fn.Livre=create_class(
	function(o){
		this.set_or_default(o, {
			accounts:	undefined,
			parents:	undefined,
			meta:		{
				message:	'',
			},
			id:		undefined,
			type:		'DC',
			$:		undefined
		});

		this.meta	= new Hash( this.meta );

		if(o.mode){
			this.meta.message='mise à zéro';
			this.accounts= ( new this.$.Comptes( [], this.$ ) ).first_root_init( pcg[o.mode] );
		}

		if(this.id === undefined )	this.save();
	},{
		toJSON:function(){
			return {
				parents:	this.parents,
				meta:		this.meta,
				type:		this.type,
				accounts:	this.accounts,
			};
		},

		toVSON:function(){
			var r = this.toJSON();
			r.accounts=this.lod('accounts').toVSON( this.$[this.type] );
			return r;
		},

		commit:function(e){
			return new this.$.Livre({
				accounts:	this.lod('accounts').mouvement(e),
				parents:	[ this.id ],
				meta:		e.meta,
				type:		this.type,
				$:		this.$,
			});
		},

		back:function(i){
			if(i===0) return this;
			if(this.parents === undefined) return this;
			// @bug BUG only handle linear case
			return this.lod( this.parents[0] ).back(i-1);
		},

		log:function(){
			return {
				id:		this.id,
				parents:	this.parents,
				meta:		this.meta
			};
		},

		history:function(){
			var l = this;
			var stack=[ l.log() ];
			while(l.back(1) !== l ){
				l=l.back(1);
				stack.push( l.log() );
			}
			return stack;
		},

		checkout:	 function	(id){
			var r = this.lod(id ||this.id);
			return (r instanceof this.$.Livre)?r:undefined;
		},

		diff:function(id){
			var Type = this.$[this.type];
			var old;

			if(id instanceof this.$.Livre ) {
				old = id;
			} else {
				old = this.lod( id );
				console.log([id, old]);
			}

			if( this.id === old.id )	return new this.$.Ecriture( { mouvement: [], meta: { message: '' } } );

			return new this.$.Ecriture( {
				mouvement:	this.lod('accounts').diff(old.lod('accounts')).map(function(e){
					return [ e[0], new Type(e[1]) ];
				}),
				meta:		this.meta
			} );
		},

		find_any_and_map:	function(targeted_accs,func){
			return this.lod('accounts').find_any(targeted_accs, func.bind( null, this.$[this.type] ) );
		},

		s_etat:	function (){
			var targets = to_array( arguments );

			var func = function (T,c) {
				return (new (c.$.Fragment)([[ c.account, c.sigma(T).quotient() ]])).add(
					c.lod('subaccounts').map(func).reduce(function(a,b){
						return a.add(b);
					}, new $fi.fn.Fragment() )
				);
			}.bind( null, this.$[this.type] );

			return this.lod('accounts').map(function(c){
				return [c, targets.filter(function(e){
					return e.indexOf(c.account)===0;
				}).length ];
			}).filter(function(e){
				return e[1] > 0;
			}).map(function(e){
				return e[0];
			}).map( func ).reduce(function(a,b){
				return a.add(b);
			}, new $fi.fn.Fragment() );
		},

		etat:	function (){
			return this.find_any_and_map( to_array( arguments ),function (T,c) {
				return c.sigma(T);
			});
		},

		r_etat:	function (){
			return this.find_any_and_map( to_array( arguments ),function (T,c) {
				return c.sigma(T).add( c.sub_sigma(T) );
			});
		},
	}, ALO );
[ 'Comptes', 'Compte', 'Ecriture', 'Journal', 'Livre', 'Entite', 'Operation' ].forEach(function(k){
	instanciable[k]=$fi.fn[k];
});

window.$fi = new $fi();		// jshint ignore:line
window.$fi.fn = $fi.prototype;

})(window);
