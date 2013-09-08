/**
 * Journal des mouvements
 *
 * Comptient la liste ordonnée de chaque mouvement sur un Compte
 */
$fi.fn.Journal=create_class(
	function(o){
		this.set_or_default(o,{
			debit:	[],
			credit:	[],
			id:	undefined,
			$:	undefined,
		});

		if(this.id === undefined)	this.save();
	},{
		sigma:function(){
			return [
				this.debit .reduce(function(a,b){	return a+b;	},0),
				this.credit.reduce(function(a,b){	return a+b;	},0)
				];
		},

		toJSON:function(){
			return {
				credit:	this.credit,
				debit:	this.debit
			};
		},

		append:function(o){
			if(o.length===0)	return this;

			var c = [];
			var d = [];
			o.forEach(function(e){
				if(e[0]) d.push(e[0]);
				if(e[1]) c.push(e[1]);
			});

			return new this.$.Journal({
				debit:	this.debit.concat(d),
				credit:	this.credit.concat(c),
				$:	this.$,
			});
		},

		diff:function(old){
			return [
				this.debit.slice(old.debit.length),
				this.credit.slice(old.credit.length),
			];
		},
	}, ALO );
