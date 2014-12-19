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
