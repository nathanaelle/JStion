$fi.fn.promise=create_class(
	function(f){
		this.f	= f;
	},
	{
		constrain:function(v){
			return v;
		},

		resolve:function(x) {
			var prom = this;
			var f = (prom.f)(prom.constrain(x));
			if(f instanceof Function) return f;
			return function(v){
				return (prom.f)(prom.constrain(x));
			};
		},

		toJSON: function(){
			return [ 'want', this.f ];
		}
	} );
