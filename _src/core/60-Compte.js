/**
 * Compte Comptable
 *
 * Décrit un Compte au sens de la comptabilité générale
 *
 */
$fi.fn.Compte=create_class(
	function(o){
		this.set_or_default(o,{
			journal:undefined,
			account:undefined,
			nom:'',
			subaccounts:undefined,
			id:undefined,
			$:undefined,
		});

		if(o.finit !== undefined && o.finit instanceof Object ){
			this.subaccounts = (new this.$.Comptes( [], this.$ )).first_root_init( o.finit );
			this.journal = (new this.$.Journal({$:this.$})).id;
		}

		if(this.id === undefined)			this.save();
		else if(this.account === undefined)	this.fetch();
	},{

		find_and_map:function(targeted_accs, func ){
			var o = this;
			var acc = this.account;

			// do I know any targeted account ?
			targeted_accs = targeted_accs.filter( function(a){ return a.indexOf(acc) ===0; });

			var maybe_empty = create_monad(function(M,v){
				if(v.length >0 )	return v;
				M.bind = function() { return new $fi.fn.Fragment([]) }
				return [];
			});

			// make a list of triplet [ account, debit, credit ] for this account and its sub account
			return maybe_empty(
					targeted_accs.filter( function(a){ return a === acc; })
				).bind(function(){
					return new $fi.fn.Fragment( [ [acc].concat( func(o) ) ] );
				}).add(
					maybe_empty(
						targeted_accs.filter( function(a){ return a !== acc; })
					).bind(function(v){
						return o.lod('subaccounts').find_any(v, func )
					}));
		},


		_solde:function(s) {
			return [s[0]-s[1], s[1]-s[0] ].map(function(i){ return i>0?i:0; });
		},

		sigma:function(){
			return this.lod('journal').sigma();
		},

		r_sigma:function(){
			return [ this.sigma() ].concat( this.lod('subaccounts').r_sigma() ).reduce(function(s0,s1){ return [s0[0]+s1[0], s0[1]+s1[1]] }, [0,0]);
		},

		solde:function(){
			return this._solde( this.sigma() );
		},

		r_solde:function(){
			return this._solde( this.r_sigma() );
		},

		diff:function(old){
			if( this.id === old.id) return [];
			var diff = [];
			var cur = this;
			if(this.account !== old.account )		throw new Exception('Y u duno compare different accounts ?');

			if(this.journal !== old.journal ){
				var c = cur.account;
				diff = this.lod('journal').diff( old.lod( 'journal') );
				diff = diff[0].map(function(i){return [c, i, '' ]}).concat( diff[1].map(function(i){return [c, '', i ]}) );
			}
			if( this.subaccounts.join(' ') === old.subaccounts.join(' '))	return diff;

			return diff.concat( this.lod('subaccounts').diff( old.lod( 'subaccounts') ) );
		},

		toJSON:function(){
			return { account:this.account, nom:this.nom, subaccounts:this.subaccounts, journal:this.journal };
		},

		toVSON:function(){
			var s=this.sigma();
			return {
				account:		this.account,
				nom:			this.nom,
				subaccounts:	this.lod('subaccounts').toVSON(),
				debit:			((s[0]>0)?s[0].toFixed(this.$.fix):''),
				credit:			((s[1]>0)?s[1].toFixed(this.$.fix):''),
				solde_debit:	((s[0]-s[1]>0)?(s[0]-s[1]).toFixed(this.$.fix):''),
				solde_credit:	((s[1]-s[0]>0)?(s[1]-s[0]).toFixed(this.$.fix):''),
			}; },

		mouvement:function(m){
			var acc = this.account;
			var subaccounts;
			m = m.filter( function(e){ return e[0].indexOf(acc) ===0; });
			// is it my problem ?
			if(m.length===0)	return false;

			var e_m = m.filter( function(e){ return e[0] === acc; }).map( function(e){ return [e[1], e[2]]; } );
			var s_m = m.filter( function(e){ return e[0] !== acc; });

			// may it my subaccounts problem ?
			if( s_m.length>0 ){
				subaccounts = this.lod('subaccounts').mouvement({ mouvement: s_m });
				if(!subaccounts)	e_m = m.map( function(e){ return [e[1], e[2]]; } );
			}

			return new $fi.fn.Compte({
				journal: this.lod('journal').append( e_m ).id,
				account: this.account,
				nom: this.nom,
				subaccounts: (subaccounts || this.subaccounts ),
				$:this.$,
			});
		},

	}, ALO );

