
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
