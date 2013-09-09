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
			date:		'',
			message:	'',
			author:		'',
			id:		undefined,
			$:		undefined
		});

		if(o.mode){
			this.message='mise à zéro';
			this.accounts= ( new this.$.Comptes( [], this.$ ) ).first_root_init( pcg[o.mode] );
		}

		if(this.id === undefined )	this.save();
	},{
		toJSON:function(){
			return {
				parents:	this.parents,
				date:		this.date,
				author:		this.author,
				message:	this.message,
				accounts:	this.accounts
			};
		},

		toVSON:function(){
			r = this.toJSON();
			r.accounts=this.lod('accounts').toVSON();
			return r;
		},

		commit:function(e){
			return new this.$.Livre({
				accounts:	this.lod('accounts').mouvement(e),
				parents:	[ this.id ],
				message:	e.message||'',
				date:		e.date||'',
				author:		e.author||'',
				$:		this.$,
			});
		},

		find_any_and_map:	function(targeted_accs,func){
			return this.lod('accounts').find_any(targeted_accs,func );
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
				message:	this.message
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

		diff:function(id){
			var old;
			if(id instanceof $fi.fn.Livre ) {
				old = id;
			} else {
				if(!(typeof id === 'string' && id.indexOf('Livre:')===0))	throw new Exception('need a Livre ref');
				old = new $fi.fn.Livre({'id': id});
			}

			if( this.id === old.id )	return new this.$.Ecriture( { mouvement: [] } );

			return new this.$.Ecriture( {
				mouvement:	this.lod('accounts').diff(old.lod('accounts')),
				message:	this.message
			} );
		},

	}, ALO );
