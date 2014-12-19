/**
 * [$fi description]
 *
 * @param  {[type]} o [description]
 *
 * @return {[type]}   [description]
 */
var $fi = create_class(
	function (o){
		o=o||{};
		o.storage=o.storage||'';

		this.storage= StorageEngine[( o.storage in StorageEngine && o.storage )||'fake'];

		//if( Backbone !== undefined && Backbone.sync !== $fi.fn.sync ) Backbone.sync = $fi.fn.sync;

		var id = this.storage.getItem( 'JStion_HEAD' );

		if(!id)	return this._set_default(o);

		this._set_default( (JSON.parse( this.storage.getItem( id ) ) ).data || o );
		this.save();
	},{

		toJSON: function (){
			return {
				parent:		this.parent,
				e:		this.e,
				entities:	this.entities
			};
		},

		_set_default:function (o){
			this.set_or_default(o,{
				e:{
					parent:		undefined,
					operateurs:	{},
					mouvements:	{},
					operations:	{},
				},
				entities:{

				},
				id:	undefined
			});
		},

		shortify: function (l){
			return l.map(function (i){
				return i.id.substr(i.id.indexOf(':')+1,7);
			}).join(' ');
		},

		want: function (f){
			return new this.promise(f);
		},

		save: function (f){
			var ret = null;
			if( f instanceof Function ) ret = f.call(this);

			this.parent = this.id;
			this.sync('update',this);
			this.storage.setItem( 'JStion_HEAD', this.id );

			return ret;
		},

		register_class: function ( name , classe , options ){
			options = options||{};
			options.instanciable = !!options.instanciable;

			this[name]=classe;

			if(options.instanciable) {
				instanciable[name] = classe;
			}

		},

		register_plan: function (fullpath,shortname,plan){
			pcg[fullpath]	= plan;
			pcg[shortname]	= plan;

		},

	},ALO);

$fi.fn = $fi.prototype;
