$fi.fn.promise=create_class(
	function(f){
		this.f	= f;
	},
	{
		constrain:function(v){return v},
		grab:function(needs,vars){
			return vars.concat(needs.slice(vars.length).map(function(n){return 1*prompt(n.f.help)}))
		},
		exec:function(x) {
			var prom = this;
			var f = (prom.f)(prom.constrain(x));
			if(f instanceof Function) return f;
			// console.log([ 'exec', x, f]);
			return function(v){
				return (prom.f)(prom.constrain(x));
			};
		},
		toJSON: function(){ return [ 'want', this.f ] }
	} );
