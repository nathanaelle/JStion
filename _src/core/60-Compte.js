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
