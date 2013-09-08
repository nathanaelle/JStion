/**
 * [$fi description]
 * 
 * @param  {[type]} o [description]
 *
 * @return {[type]}   [description]
 */
var $fi = create_class(
	function(o){
		o=o||{};
		o.storage=o.storage||'';

		this.storage= StorageEngine[( o.storage in StorageEngine && o.storage )||'fake'];

		//if( Backbone !== undefined && Backbone.sync !== $fi.fn.sync ) Backbone.sync = $fi.fn.sync;

		var id = this.storage.getItem( 'JStion_HEAD' );

		if(!id)	return this._set_default(o);

		this._set_default( (JSON.parse( this.storage.getItem( id ) ) ).data || o );
	},{

		toJSON: function(){ return {  parent: this.parent, e: this.e, entites: this.entites, fix:this.fix  } },

		_set_default:function(o){
			this.set_or_default(o,{
				fix: 2,
				e:{
					parent: undefined,
					operateurs: {},
					mouvements: {},
					operations: {},
				},
				entites:{

				},
				id: undefined,
			})
		},


		societe: function(name){
			return this.sync('read', { id:this.entites[name] } ) || new this.Entite({ nom: name, $:this })
		},

		shortify: function(l){
			return l.map(function(i){ return i.id.substr(i.id.indexOf(':')+1,4) }).join(' ')
		},

		want: function(f){
			return new this.promise(f)
		},

		save:function(o){
			this.parent = this.id;
			this.sync('update',this);
			this.storage.setItem( 'JStion_HEAD', this.id );
		},

		update: function(o){
			this.entites[o.nom] = o.id;
			this.save();
			return o
		},



	},ALO);

$fi.fn = $fi.prototype;
