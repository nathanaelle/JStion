/**
 * Hash Class
 * @type {Object}
 */
var Hash = create_class(
	function(o){
		if(!o)	return;
		for(var i in o)		if(o.hasOwnProperty(i))	this[i] = o[i];
	},{
		concat:function(o){
			var r = new Hash(this);
			for(var i in o)	if(o.hasOwnProperty(i))	this[i] = o[i];
			return r;
		},
	},Object);
