/**
 * Entite comptable
 * 
 * Decrit une entité comptable tel qu'une entreprise, une société, une association, ...
 */
$fi.fn.Entite= create_class(
	function(o){
		this.set_or_default(o,{
			parent:undefined,
			nom:'acme',
			livre:undefined,
			mode:'abrege',
			fiche:{},
			tags:{},
			id:undefined,
			$:undefined
		});

		this.tags	= new Hash( this.tags );
		this.fiche	= new Hash( this.fiche );

		if( this.livre === undefined ){
			this.livre=( new this.$.Livre({
				mode:	this.mode,
				$:	this.$
			}) ).id;
		}
		if(!this.id) this.save();
	},{
		toJSON:function(){
			return {
				parent:	this.parent,
				nom:	this.nom,
				mode:	this.mode,
				fiche:	this.fiche,
				livre:	this.livre,
				tags:	this.tags
			};
		},

		toVSON:function(){
			var r =this.toJSON();
			r.livre=this.lod('livre').toVSON();
			r.message=this.log().message;
			return r;
		},

		tag:function(tag){
			return this.lod( this.tags[tag] );
		},

		set_tag:function(tag,livre_ref)	{
			var t = {};
			t[tag] = livre_ref || this.livre;

			return $this.$.update( new $fi.fn.Entite({
				parent:		this.id,
				nom:		this.nom,
				livre:		this.livre,
				mode:		this.mode,
				fiche:		this.fiche,
				tags:		this.tag.concat( t ),
				$:		this.$,
			}) );
		},

		commit:function(e){
			return this.$.update( new $fi.fn.Entite({
				parent:		this.id,
				nom:		this.nom,
				livre:		this.lod('livre').commit(e).id,
				mode:		this.mode,
				fiche:		this.fiche,
				tags:		this.tags,
				$:		this.$,
			}) );
		},

		etat:	function(){
			return this.lod('livre').find_any_and_map( [].concat(Array.prototype.slice.call( arguments )),function(c) {
				return c.sigma();
			});
		},

		solde:	function(){
			return this.lod('livre').find_any_and_map( [].concat(Array.prototype.slice.call( arguments )),function(c) {
				return c.solde();
			});
		},

		flux:	function(){
			return this.lod('livre').find_any_and_map( [].concat(Array.prototype.slice.call( arguments )),function(c) {
				return c.r_sigma();
			});
		},

		log:	function(){
			return this.lod('livre').log();
		},

		history:function(){
			return this.lod('livre').history();
		},

		back:	function(i){
			return this.lod('livre').back(i);
		},

		diff:	function(id){
			return this.lod('livre').diff(id);
		},

	}, ALO );
