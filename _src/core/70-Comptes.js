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
