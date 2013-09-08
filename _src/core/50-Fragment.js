/**
 * Fragment d'écriture ou de compte
 *
 *
 */
$fi.fn.Fragment=create_class(
	function(e){
		this.single=false;
		if(e ===undefined) e=[];
		Array.prototype.push.apply( this, e );
	},{

		toJSON:function(){
			return this.map(function(f){
				return f;
			});
		},

		toVSON:function(){
			if(this.single){
				return this.map(function(f){
					if(f[0] === '')	return ['',''];
					return [ f[0], (f[1]-f[2]).toFixed(window.$fi.fix) ];
				});
			}

			return this.map(function(f){
				if(f[0] === '')	return ['','', ''];

				return [f[0]].concat( [f[1], f[2]].map(function(i){
					return (i>0?i.toFixed(window.$fi.fix):0);
				}));
			});
		},

		add:function(f){
			if(f === undefined) return this;

			//var z = [];
			//Array.prototype.push.apply( z, this );
			//Array.prototype.push.apply( z, f );

			return new $fi.fn.Fragment( [].concat( Array.prototype.slice.call(this), Array.prototype.slice.call(f) ) );
		},

		sub:function(f){
			return this.add(f.inv());
		},

		simplify:function(t){
			return new $fi.fn.Fragment( [
				[t].concat( this.reduce(function(a,b){
					return [ a[0] + b[1] , a[1] + b[2] ];
				},[0,0] ))
			]);
		},

		inv:function(){
			return new $fi.fn.Fragment( this.map(function(f){
				return [ f[0], f[2], f[1] ];
			}));
		},

		solde:function(){
			return new $fi.fn.Fragment( this.map(function(s){
				return [s[0]].concat( [s[1]-s[2], s[2]-s[1] ].map(function(i){
					return i>0?i:0;
				}));
			}) );
		},

		debit:function(){
			return new $fi.fn.Fragment( this.map(function(s){
				return [s[0], s[1], 0 ];
			}));
		},

		credit:function(){
			return new $fi.fn.Fragment( this.map(function(s){
				return [s[0], 0, s[2] ]; }));
		},

		single_col:function(b){
			this.single=!!b;
			return this;
		}

	}, Array );

