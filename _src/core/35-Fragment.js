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
