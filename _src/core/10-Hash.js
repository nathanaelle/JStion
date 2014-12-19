/**
 * Hash Class
 * @type {Object}
 */
var Hash = create_class(
	function(o){
		if(!o)	return;
		Object.keys(o).forEach(function(k){
			this[k] = o[k];
		}.bind(this));
	},{
		concat:function(o){
			var r = new Hash(this);

			Object.keys(o).forEach(function(k){
				if(r.hasOwnProperty(k))	r[k] += "\n" + o[k];
				else			r[k] = o[k];
			});

			return r;
		},

	},Object);
