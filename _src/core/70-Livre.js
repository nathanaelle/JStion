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
