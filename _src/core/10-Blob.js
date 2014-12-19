var Blob=create_class(
	function(o){
		this.set_or_default(o,{
			data:	'',
			meta:	{},
			livre:	undefined,
			id:	undefined,
			$:	undefined,
		});

		this.meta	= new Hash( this.meta );

		if(this.id === undefined)	this.save();
	},{

		toJSON:function(){
			return {
				data:	this.data
			};
		},

		toVSON:function(){
			return this.data;
		}

	}, ALO );
