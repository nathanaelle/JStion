/**
 * Journal des mouvements
 *
 * Comptient la liste ordonnée de chaque mouvement sur un Compte
 */
$fi.fn.Journal=create_class(
	function (o){
		this.set_or_default(o,{
			data:	[],
			id:	undefined,
			$:	undefined,
		});

		if(this.id === undefined)	this.save();
	},{
		toJSON:	function (){
			return {
				data: this.data.slice(0),
			};
		},

		append:	function (o){
			if(o.length===0)	return this;

			return new this.$.Journal({
				data:	this.data.concat(o),
				$:	this.$,
			});
		},

		diff:	function (old){
			return	this.data.slice(old.data.length);
		},

		cast:	function (Type){
			return this.data.map(function(e){
				return new Type(e);
			});
		},

	}, ALO );
